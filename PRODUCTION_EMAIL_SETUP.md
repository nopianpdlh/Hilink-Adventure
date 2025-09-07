# Production Email Setup Guide

## Overview
HiLink Adventure menggunakan sistem email konfirmasi yang modern dengan React Email templates dan Resend API untuk pengalaman pengguna yang profesional.

## Features
- ✅ Professional email templates with React Email
- ✅ Production-ready URL handling
- ✅ Environment-aware configuration
- ✅ Custom confirmation pages
- ✅ Resend API integration

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env.local` and update the values:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=HiLink Adventure <noreply@your-domain.com>
```

### 2. Resend Setup
1. Sign up at [resend.com](https://resend.com)
2. Add your domain and verify DNS records
3. Get your API key from the dashboard
4. Add the API key to your environment variables

### 3. Supabase Auth Configuration
Update your Supabase project settings:

1. Go to Authentication > Settings
2. Update **Site URL** to your production domain
3. Add your production domain to **Redirect URLs**
4. Configure email templates (optional - we use custom templates)

### 4. Domain Configuration
Ensure your production domain is properly configured:
- Update `NEXT_PUBLIC_SITE_URL` in environment variables
- Verify domain ownership with Resend
- Test email delivery in production

## How It Works

### Registration Flow
1. User registers with email/password
2. System uses `authConfig.getSignUpOptions()` for environment-aware URLs
3. Supabase sends confirmation email to user
4. User clicks confirmation link → redirected to `/auth/callback`
5. Callback handler verifies token and redirects to `/auth/confirmed`

### Email Template
- Located in: `src/emails/WelcomeConfirmation.tsx`
- Professional design with company branding
- Mobile-responsive layout
- Includes call-to-action buttons and features overview

### Configuration Files
- `src/lib/auth-config.ts` - Environment-aware URL handling
- `src/app/api/send-welcome-email/route.ts` - Custom email sending (optional)
- `src/app/auth/callback/route.ts` - Email confirmation handler
- `src/app/auth/confirmed/page.tsx` - Success page after confirmation

## Testing

### Development
```bash
npm run dev
```
- Test registration with real email address
- Check email delivery in development
- Verify URLs point to localhost:3000

### Production
1. Deploy to your hosting platform
2. Set production environment variables
3. Test complete registration flow
4. Verify emails are delivered with correct URLs

## Troubleshooting

### Common Issues
1. **Emails redirect to localhost**: Check `NEXT_PUBLIC_SITE_URL` environment variable
2. **Emails not delivered**: Verify Resend API key and domain verification
3. **Confirmation fails**: Check Supabase redirect URL configuration
4. **TypeScript errors**: Ensure all dependencies are installed

### Debug Commands
```bash
# Check environment variables
echo $NEXT_PUBLIC_SITE_URL

# Test email template rendering
npm run dev
# Visit: http://localhost:3000/api/send-welcome-email (POST request)
```

## Security Considerations
- Never expose RESEND_API_KEY in client-side code
- Use secure environment variable management
- Verify email domain ownership
- Monitor email delivery rates and bounces

## Next Steps
1. Customize email template branding
2. Add email analytics tracking
3. Implement welcome email automation
4. Set up email monitoring and alerts
