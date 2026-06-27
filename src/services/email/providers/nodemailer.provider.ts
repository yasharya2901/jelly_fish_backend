import { envVars } from "../../../config/env.js";
import type { EmailProvider } from "./email-provider.js";
import nodemailer from "nodemailer";

export class NodemailerProvider implements EmailProvider {
    private transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        pool: true,
        auth: {
            user: envVars.EMAIL_USER,
            pass: envVars.EMAIL_PASSWORD
        }
    })
    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        await this.transporter.sendMail({
            from: envVars.EMAIL_USER,
            to,
            subject,
            html
        })
    }
    
}
