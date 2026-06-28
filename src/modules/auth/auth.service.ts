import ejs from "ejs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { UserModel } from "../users/user.model.js";
import { RefreshTokenModel, RegistrationTokenModel } from "./auth.model.js";
import { emailService } from "../../services/email/email.service.js";
import { AppError } from "../../shared/errors/AppError.js";
import { StatusCodes } from "http-status-codes";
import { generateOtp } from "./otpGenerator.js";
import { MAX_REGISTRATION_OTP_DIGIT, MAX_REGISTRATION_ATTEMPTS, OTP_TTL_MS, REFRESH_TOKEN_TTL_MS, REGISTRATION_WINDOW_MS, RESEND_COOLDOWN_MS } from "../../config/constants.js";
import { createLogger } from "../../shared/utils/logger.js";
import { generateUsernameFromEmail } from "../users/inviteCodeGenerator.js";
import { generateRefreshToken, getAccessToken, hashString } from "./tokens.js";
import { randomUUID } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logger = createLogger(import.meta.url);

class AuthService {
    async registerUser(email: string, inviteCode: string, deviceId?: string) {
        email = email.toLowerCase().trim();

        // check if email already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new AppError(
                "User already exists with the current email.", 
                StatusCodes.CONFLICT
            );
        }

        // find if the invite code belongs to a user
        const referrer = await UserModel.findByInviteCode(inviteCode);
        if (!referrer) {
            throw new AppError(
                "Invalid Invite Code.", 
                StatusCodes.BAD_REQUEST
            );
        }

        
        // check if the registration token exists for the email
        let token = await RegistrationTokenModel.findOne({type: "EMAIL", target: email});
        const now = Date.now();
        
        if (token) {
            // prune registration attempts outside the sliding window
            token.registrationAttempts = token.registrationAttempts.filter(
                (ts) => ts.getTime() > now - REGISTRATION_WINDOW_MS
            );

            if (token.expiresAt.getTime() < now) {
                token.status = "EXPIRED";
            }

            if (token.status === "EXPIRED") {
                // sliding window check
                if (token.registrationAttempts.length >= MAX_REGISTRATION_ATTEMPTS) {
                    throw new AppError(
                        "Maximum registration attempts reached. Please try again later.",
                        StatusCodes.TOO_MANY_REQUESTS
                    );
                }

                // reset lifecycle if expired
                token.resendCount = 0;
                token.retryAttempt = 0;
                token.status = "PENDING";
                token.registrationAttempts.push(new Date(now));
            }

            // Resend cooldown check
            if (
                token.lastSentAt &&
                now - token.lastSentAt.getTime() < RESEND_COOLDOWN_MS
            ) {
                throw new AppError(
                    "Please wait before requesting another OTP",
                    StatusCodes.TOO_MANY_REQUESTS
                );
            }

            // Resend limit check
            if (token.resendCount >= token.maxResendCount) {
                throw new AppError(
                    "Maximum OTP resend limit reached",
                    StatusCodes.TOO_MANY_REQUESTS
                );
            }

            if (token.inviteCode !== inviteCode) {
                token.inviteCode = inviteCode;
            }
            token.resendCount += 1;
            // reset retry attempts since a new OTP will be generated
            token.retryAttempt = 0;

        } else {
            token = new RegistrationTokenModel({
                type: "EMAIL",
                target: email,
                inviteCode: inviteCode,
                resendCount: 0,
                retryAttempt: 0,
                status: "PENDING",
                registrationAttempts: [new Date(now)]
            });
        }

        if (deviceId) {
            token.deviceId = deviceId;
        }
        
        const otp = generateOtp(false, MAX_REGISTRATION_OTP_DIGIT);
        const otpHash = hashString(otp);

        const nowDate = new Date();

        token.otpHash = otpHash;
        token.otpRequestedAt = nowDate;
        token.lastSentAt = nowDate;
        token.expiresAt = new Date(now + OTP_TTL_MS);

        await token.save();
        
        // generate otp template
        const templatePath = path.join(__dirname, "../../templates/registrationOtp.ejs");
        const otpHtmlTemplate = await ejs.renderFile(templatePath, {
            otp: otp,
            email: token.target
        });

        // send the email asynchronously so we don't block the response
        emailService.sendEmail(email, "JellyFish - Verify Your Account", otpHtmlTemplate).catch(async (err) => {
            token.errorMessage = err.message;
            await token.save();
            logger.error("Failed to send OTP email:", err);
        });

        return token._id.toString();
    }

    async verifyOtp(tokenId: string, otp: string) {
        // get the registration token from the tokenId
        const token = await RegistrationTokenModel.findById(tokenId);
        if (!token) {
            throw new AppError(
                "Invalid Registration Token",
                StatusCodes.NOT_FOUND
            )
        }

        if (token.status === "EXPIRED") {
            throw new AppError(
                "Registration Token has expired. Please request a new OTP.",
                StatusCodes.BAD_REQUEST
            )
        }

        if (token.retryAttempt >= token.maxRetryAttempt) {
            throw new AppError(
                "Too many requests. Please try again later.",
                StatusCodes.TOO_MANY_REQUESTS
            )
        }

        const otpHash = hashString(otp);

        if (token.otpHash !== otpHash) {
            token.retryAttempt += 1;
            await token.save();
            throw new AppError(
                "Incorrect Otp",
                StatusCodes.BAD_REQUEST
            )
        }

        // otp match is successful
        token.status = "VERIFIED"

        let referrer = await UserModel.findByInviteCode(token.inviteCode);
        
        if (!referrer) {
            throw new AppError(
                "Referrer not found. Please check the invite code.",
                StatusCodes.NOT_FOUND
            )
        }

        let newUserName = await generateUsernameFromEmail(token.target);

        const user = await UserModel.create({
            emailId: token.target,
            referredByUserId: referrer._id,
            emailVerified: true,
            username: newUserName
        })

        await token.save();

        // create an access token
        const accessToken = await getAccessToken(user._id.toString());
        const newRefreshToken = generateRefreshToken();
        await RefreshTokenModel.create({
            userId: user._id,
            ...(token.deviceId ? { deviceId: token.deviceId } : {}),
            familyId: randomUUID(),
            tokenHash: hashString(newRefreshToken),
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS) // 30 days
        })

        return {
            accessToken,
            refreshToken: newRefreshToken,
        }
    }

    async resendOtp(tokenId: string) {
        const token = await RegistrationTokenModel.findById(tokenId);
        if (!token) {
            throw new AppError(
                "Invalid Registration Token",
                StatusCodes.NOT_FOUND
            );
        }

        if (token.status === "EXPIRED") {
            throw new AppError(
                "Registration Token has expired. Please request a new OTP.",
                StatusCodes.BAD_REQUEST
            );
        }

        // Resend cooldown check
        const now = Date.now();
        if (
            token.lastSentAt &&
            now - token.lastSentAt.getTime() < RESEND_COOLDOWN_MS
        ) {
            throw new AppError(
                "Please wait before requesting another OTP",
                StatusCodes.TOO_MANY_REQUESTS
            );
        }

        // Resend limit check
        if (token.resendCount >= token.maxResendCount) {
            throw new AppError(
                "Maximum OTP resend limit reached",
                StatusCodes.TOO_MANY_REQUESTS
            );
        }

        const otp = generateOtp(false, MAX_REGISTRATION_OTP_DIGIT);
        const otpHash = hashString(otp);

        token.otpHash = otpHash;
        token.otpRequestedAt = new Date();
        token.lastSentAt = new Date();
        token.expiresAt = new Date(now + OTP_TTL_MS);
        token.resendCount += 1;
        // reset retry attempts since a new OTP will be generated
        token.retryAttempt = 0;

        await token.save();

        // generate otp template
        const templatePath = path.join(__dirname, "../../templates/registrationOtp.ejs");
        const otpHtmlTemplate = await ejs.renderFile(templatePath, {
            otp: otp,
            email: token.target
        });

        // send the email asynchronously so we don't block the response
        emailService.sendEmail(token.target, "JellyFish - Verify Your Account", otpHtmlTemplate).catch(async (err) => {
            token.errorMessage = err.message;
            await token.save();
            logger.error("Failed to send OTP email:", err);
        });

        return true;
    }

    async refreshToken(refreshToken: string) {
        const refreshTokenHash = hashString(refreshToken);

        const tokenDoc = await RefreshTokenModel.findOne({ tokenHash: refreshTokenHash });
        if (!tokenDoc) {
            throw new AppError(
                "Invalid Refresh Token",
                StatusCodes.UNAUTHORIZED
            );
        }

        // check if the refresh token has been revoked
        if (tokenDoc.revokedAt && tokenDoc.revokedAt.getTime() < Date.now()) {
            throw new AppError(
                "Refresh Token has been revoked. Please login again.",
                StatusCodes.UNAUTHORIZED
            );
        }

        // check if the user is suspended
        const user = await UserModel.findById(tokenDoc.userId);
        if (!user) {
            throw new AppError(
                "User not found. Please login again.",
                StatusCodes.UNAUTHORIZED
            );
        }

        if (user.suspended) {
            throw new AppError(
                "User is suspended. Please contact support.",
                StatusCodes.FORBIDDEN
            );
        }

        if (tokenDoc.expiresAt.getTime() < Date.now()) {
            throw new AppError(
                "Refresh Token has expired. Please login again.",
                StatusCodes.UNAUTHORIZED
            );
        }

        // generate new access token
        const accessToken = await getAccessToken(tokenDoc.userId.toString());

        // generate new refresh token
        const newRefreshToken = generateRefreshToken();
        
        // revoke the old refresh token and save the new one
        tokenDoc.revokedAt = new Date();
        await tokenDoc.save();

        await RefreshTokenModel.create({
            userId: tokenDoc.userId,
            ...(tokenDoc.deviceId ? { deviceId: tokenDoc.deviceId } : {}),
            familyId: tokenDoc.familyId,
            tokenHash: hashString(newRefreshToken),
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS) // 30 days
        });

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
}

export const authService = new AuthService();
