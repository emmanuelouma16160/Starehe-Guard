import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'security@stasentry.com',
      subject,
      html: html || text,
      text: text || html?.replace(/<[^>]*>/g, '') || '',
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};