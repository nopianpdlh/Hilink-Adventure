// src/lib/email.ts

import { Resend } from 'resend';
import { WelcomeConfirmationEmail } from '@/emails/WelcomeConfirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendWelcomeEmailProps {
  to: string;
  customerName: string;
  confirmationUrl: string;
}

export async function sendWelcomeEmail({
  to,
  customerName,
  confirmationUrl,
}: SendWelcomeEmailProps) {
  try {
    const data = await resend.emails.send({
      from: 'HiLink Adventure <noreply@hilink-adventure.com>',
      to: [to],
      subject: '🏔️ Selamat Datang di HiLink Adventure! Konfirmasi Email Anda',
      react: WelcomeConfirmationEmail({
        customerName,
        confirmationUrl,
      }),
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

// Function to get proper confirmation URL based on environment
export function getConfirmationUrl(token: string): string {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com')
    : 'http://localhost:3001';
    
  return `${baseUrl}/auth/callback?token=${token}`;
}

// Function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to generate confirmation token (if needed)
export function generateConfirmationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
