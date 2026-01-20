import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    defaultSender: string;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: 'a07ce7001@smtp-brevo.com',
                pass: 'xsmtpsib-081e3731354839e433b609830fdcf90dd649b119d04b5e89d630dd0a170bbb24-fyhVFge2g9q0p6fI',
            },
            tls: {
                ciphers: 'SSLv3',
            },
        });
        this.defaultSender = '"Check event" <check.event.org@gmail.com>';

        this.verifyConnection();
    }

    private async verifyConnection(): Promise<void> {
        try {
            await this.transporter.verify();
            console.log('Brevo SMTP connection verified successfully');
        } catch (error) {
            console.error('Failed to connect to Brevo SMTP:', error);
        }
    }

    async sendEmail(
        to: string | string[],
        subject: string,
        html: string,
        options?: {
            from?: string;
            text?: string;
            cc?: string;
            bcc?: string;
            attachments?: any[];
        }
    ): Promise<any> {
        try {
            const mailOptions = {
                from: options?.from || this.defaultSender, 
                to: Array.isArray(to) ? to.join(', ') : to,
                subject,
                html,
                text: options?.text || this.stripHtml(html),
                cc: options?.cc,
                bcc: options?.bcc,
                attachments: options?.attachments,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully from:', mailOptions.from);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    private stripHtml(html: string): string {
        return html.replace(/<[^>]*>?/gm, '');
    }

}