import ejs from "ejs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { UserModel } from "../users/user.model.js";
import { RegistrationTokenModel } from "./auth.model.js";
import { emailService } from "../../services/email/email.service.js";
import { AppError } from "../../shared/errors/AppError.js";
import { StatusCodes } from "http-status-codes";
import { generateOtp } from "./otpGenerator.js";
import { MAX_REGISTRATION_OTP_DIGIT } from "../../config/constants.js";
import { hashOtp } from "./hashOtp.js";
import { createLogger } from "../../shared/utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logger = createLogger(import.meta.url);

class AuthService {
    async registerUser(email: string, inviteCode: string) {
        // check if email already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new AppError("User already exists with the current email.", StatusCodes.CONFLICT);
        }

        // find if the invite code belongs to a user
        const referrer = await UserModel.findByInviteCode(inviteCode);
        if (!referrer) {
            throw new AppError("Invalid Invite Code.", StatusCodes.BAD_REQUEST);
        }

        // check if the registration token exists for the email
        let regToken = await RegistrationTokenModel.findOne({email});
        
        if (regToken) {
            const now = Date.now();
            const otpRequestedAt = regToken.otpRequestedAt.getTime();

            const ONE_MIN = 60 * 1_000;
            if (now - otpRequestedAt < ONE_MIN) {
                throw new AppError("OTP already sent. Please wait before requesting again.", StatusCodes.TOO_MANY_REQUESTS);
            }

            regToken.retryAttempt += 1;

        } else {
            regToken = new RegistrationTokenModel({email: email});
        }
        
        const otp = this.createOtp();
        regToken.otpHash = hashOtp(otp);
        regToken.otpRequestedAt = new Date();
        await regToken.save();
        
        // generate otp template
        const templatePath = path.join(__dirname, "../../templates/registrationOtp.ejs");
        const otpHtmlTemplate = await ejs.renderFile(templatePath, {
            otp: otp,
            email: regToken.email
        });
        // TODO: Handle idempotency

        // send the email asynchronously so we don't block the response
        emailService.sendEmail(email, "JellyFish - Verify Your Account", otpHtmlTemplate).catch(async (err) => {
            regToken.errorMessage = err.message;
            await regToken.save();
            logger.error("Failed to send OTP email:", err);
        });

        return regToken._id;
    }

    private createOtp() {
        return generateOtp(false, MAX_REGISTRATION_OTP_DIGIT);
    }
}

export const authService = new AuthService();