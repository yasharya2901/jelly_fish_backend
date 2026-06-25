import ejs from "ejs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { UserModel } from "../users/user.model.js";
import { RegistrationTokenModel } from "./auth.model.js";
import { emailService } from "../../services/email/email.service.js";
import { AppError } from "../../shared/errors/AppError.js";
import { StatusCodes } from "http-status-codes";
import { generateOtp } from "./otpGenerator.js";
import { MAX_REGISTRATION_OTP_DIGIT, OTP_TTL_MS, RESEND_COOLDOWN_MS } from "../../config/constants.js";
import { hashOtp } from "./hashOtp.js";
import { createLogger } from "../../shared/utils/logger.js";
import { email } from "zod";
import { generateUsernameFromEmail } from "../users/inviteCodeGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logger = createLogger(import.meta.url);

class AuthService {
    async registerUser(email: string, inviteCode: string) {
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
            if (token.expiresAt.getTime() < now) {
                token.status = "EXPIRED";
            }

            if (token.status === "EXPIRED") {
                // reset lifecycle if expired
                token.resendCount = 0;
                token.retryAttempt = 0;
                token.status = "PENDING";
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

        } else {
            token = new RegistrationTokenModel({
                type: "EMAIL",
                target: email,
                inviteCode: inviteCode,
                resendCount: 0,
                retryAttempt: 0,
                status: "PENDING"
            });
        }
        
        const otp = generateOtp(false, MAX_REGISTRATION_OTP_DIGIT);
        const otpHash = hashOtp(otp);

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

        const otpHash = hashOtp(otp);

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

        // get the access token and refresh token

        return {
            userId: user._id.toString(),
            email: user.emailId,
            username: user.username
        }
    }
}

export const authService = new AuthService();