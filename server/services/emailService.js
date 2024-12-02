import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import UserRequest from '../models/user_request_model.js';
dotenv.config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendUserRequestService(email, passwordSetupLink) {
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Invitation to Join Our Platform',
            html: `
                <h1>Welcome!</h1>
                <p>You have been invited to create an Admin account.</p>
                <p>Click the link below to set up your informatin</p>
                <a href="${passwordSetupLink}">Set Up Info</a>
                <p>This link will expire in 24 hours.</p>
            `
        };
        await this.transporter.sendMail(mailOptions);
    }

    async resetPasswordService(email, passwordResetLink) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset</h1>
                <p>You have requested to reset your password.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${passwordResetLink}">Reset Password</a>
                <p>This link will expire in 15 min.</p>
            `
        };
        await this.transporter.sendMail(mailOptions);
    }
}

const emailService = new EmailService();
export default emailService;