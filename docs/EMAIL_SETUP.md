# Email Service Setup

This document describes how to configure the email service for Yurafy, which handles email verification and password reset functionality.

## Features

- **Email Verification**: Sends verification emails to new users during signup
- **Password Reset**: Sends password reset links to users who forgot their passwords
- **Multiple Providers**: Supports SendGrid, SMTP, and Ethereal (development)

## Installation

Install the required dependency:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## Configuration

### Option 1: SendGrid (Recommended)

1. Sign up for a SendGrid account at https://sendgrid.com
2. Create an API key in the SendGrid dashboard
3. Add to your `.env` file:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

### Option 2: SMTP (Gmail, Outlook, etc.)

Add to your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

**Note for Gmail**: You'll need to generate an "App Password" in your Google Account settings.

### Option 3: Development (Ethereal Email)

For development, if no SMTP is configured, the system will automatically use Ethereal Email (test emails). The preview URL will be logged to the console.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SENDGRID_API_KEY` | SendGrid API key | If using SendGrid |
| `SMTP_HOST` | SMTP server host | If using SMTP |
| `SMTP_PORT` | SMTP server port | If using SMTP |
| `SMTP_SECURE` | Use TLS/SSL | If using SMTP |
| `SMTP_USER` | SMTP username | If using SMTP |
| `SMTP_PASS` | SMTP password | If using SMTP |
| `EMAIL_FROM` | From email address | Recommended |
| `NEXTAUTH_URL` | Base URL for email links | Required |
| `NEXT_PUBLIC_BASE_URL` | Public base URL | Required |

## Usage

The email service is automatically used in:

1. **Signup Flow**: Sends verification email when user registers
2. **Email Verification**: Resends verification email if needed
3. **Password Reset**: Sends reset link when user requests password reset

## Email Templates

Email templates are defined in `lib/services/emailService.ts` and include:

- Brand blue color scheme (`#0ea5e9`)
- Responsive HTML design
- Clear call-to-action buttons
- Mobile-friendly layout

## Testing

In development mode, if using Ethereal Email, check the console for preview URLs:

```
Email preview URL: https://ethereal.email/message/...
```

## Troubleshooting

### Emails not sending

1. Check that environment variables are set correctly
2. Verify SMTP credentials or SendGrid API key
3. Check server logs for error messages
4. In development, check console for Ethereal preview URLs

### Email links not working

1. Ensure `NEXTAUTH_URL` or `NEXT_PUBLIC_BASE_URL` is set correctly
2. Check that the URL matches your deployment domain
3. Verify email links are not being blocked by email clients

## Security

- Email verification tokens expire after 24 hours
- Password reset tokens expire after 1 hour
- Tokens are cryptographically secure (32-byte random hex)
- Rate limiting is applied to prevent abuse

## Customization

To customize email templates, edit the `sendVerificationEmail` and `sendPasswordResetEmail` methods in `lib/services/emailService.ts`.

