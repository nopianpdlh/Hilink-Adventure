// src/app/api/send-welcome-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { WelcomeConfirmationEmail } from '@/emails/WelcomeConfirmation'
import { render } from '@react-email/render'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, confirmationUrl } = await request.json()

    if (!email || !fullName || !confirmationUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Render the email template to HTML
    const emailHtml = await render(
      WelcomeConfirmationEmail({
        customerName: fullName,
        confirmationUrl: confirmationUrl,
      })
    )

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'HiLink Adventure <noreply@hilink-adventure.com>',
      to: [email],
      subject: 'Welcome to HiLink Adventure - Confirm Your Email',
      html: emailHtml,
    })

    if (error) {
      console.error('Error sending email:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Email sent successfully', data },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
