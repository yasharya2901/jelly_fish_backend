import type { EmailProvider } from "./email-provider.js";
import nodemailer from "nodemailer";

export class NodemailerProvider implements EmailProvider {
    private transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        await this.transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        })
    }
    
}
