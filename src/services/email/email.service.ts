import type { EmailProvider } from "./providers/email-provider.js";
import { NodemailerProvider } from "./providers/nodemailer.provider.js";

class EmailService {
    constructor(private readonly provider: EmailProvider) {}
    async sendEmail(to: string, subject: string, template: string) {
        await this.provider.sendEmail(to, subject, template);
    }
}

const nodeMailer = new NodemailerProvider();
export const emailService = new EmailService(nodeMailer);
