import { RegistrationTokenModel } from "../models/auth.js";
import { UserModel } from "../models/user.js";
import ejs from "ejs";
import { emailService } from "./email.service.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AuthService {
    async registerUser(email: string, inviteCode: string) {
        // check if email already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new Error("User already exists with the current email.")
        }

        // find if the invite code belongs to a user
        const referrer = await UserModel.findByInviteCode(inviteCode);
        if (!referrer) {
            throw new Error("Invalid Invite Code.")
        }

        // generate a new registration token
        const regToken = new RegistrationTokenModel({email: email});
        await regToken.createOtp();
        
        // generate otp template
        const templatePath = path.join(__dirname, "../template/registrationOtp.ejs");
        const otpHtmlTemplate = await ejs.renderFile(templatePath, {
            otp: regToken.otp
        });

        // send the email asynchronously so we don't block the response
        emailService.sendEmail(email, "Verify Your Account", otpHtmlTemplate).catch((err) => {
            // TODO: Log the error to the registration token for further evaluation
            console.error("Failed to send OTP email:", err);
        });

        return regToken._id;
    }
}

export const authService = new AuthService();