// src/modules/services/brevo.email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as brevo from '@getbrevo/brevo';

@Injectable()
export class BrevoEmailService {
    private readonly logger = new Logger(BrevoEmailService.name);
    private apiInstance: brevo.TransactionalEmailsApi;
    private defaultSender: { email: string; name: string };

    constructor() {
        const apiKey = process.env.BREVO_SMTP_PASS2;

        const configuration = {
            apiKey: apiKey
        }

        this.apiInstance = new brevo.TransactionalEmailsApi(configuration + '');

        this.defaultSender = {
            email: process.env.MAIL_USER || 'check.event.org@gmail.com',
            name: process.env.EMAIL_SENDER_NAME || 'Check event',
        };

        this.logger.log('Brevo API service initialized');
    }

    async sendEmail(
        to: string,
        subject: string,
        htmlContent: string,
        options?: {
            textContent?: string;
            sender?: { email: string; name?: string };
            cc?: Array<{ email: string; name?: string }>;
            bcc?: Array<{ email: string; name?: string }>;
            replyTo?: { email: string; name?: string };
            tags?: string[];
        },
    ): Promise<any> {
        try {
            const sendSmtpEmail: brevo.SendSmtpEmail = {
                sender: options?.sender || this.defaultSender,
                to: [{
                    email: to,
                    name: options?.sender?.name || '',
                }],
                subject: subject,
                htmlContent: htmlContent,
                textContent: options?.textContent || this.stripHtml(htmlContent),
            };

            if (options?.cc && options.cc.length > 0) {
                sendSmtpEmail.cc = options.cc;
            }

            if (options?.bcc && options.bcc.length > 0) {
                sendSmtpEmail.bcc = options.bcc;
            }

            if (options?.replyTo) {
                sendSmtpEmail.replyTo = options.replyTo;
            }

            if (options?.tags && options.tags.length > 0) {
                sendSmtpEmail.tags = options.tags;
            }

            this.logger.debug(`Sending email to: ${to}, Subject: ${subject}`);

            const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

            this.logger.log(`Email sent successfully to ${to}`);
            return data;

        } catch (error) {
            this.logger.error('Failed to send email via Brevo API:', error);
            console.error('Error details:', error.response?.data || error.message);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    async sendEmailSimple(
        to: string,
        subject: string,
        html: string,
    ): Promise<any> {
        try {
            const apiKey = process.env.BREVO_SMTP_PASS2;

            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json',
                } as HeadersInit,
                body: JSON.stringify({
                    sender: {
                        name: 'Smatchin Admin',
                        email: 'noreply@smatchin.com',
                    },
                    to: [{ email: to }],
                    subject,
                    htmlContent: html,
                }),
            });


            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
            }

            return await response.json();

        } catch (error) {
            this.logger.error('Failed to send email:', error);
            throw error;
        }
    }

    private stripHtml(html: string): string {
        return html
            .replace(/<[^>]*>?/gm, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
}