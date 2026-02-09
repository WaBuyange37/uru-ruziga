// lib/email.ts - Email service for OTP and notifications

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send email using a service (configure based on your preference)
 * Options: SendGrid, Resend, Nodemailer, AWS SES, etc.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // For development, log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:', {
        to: options.to,
        subject: options.subject,
        preview: options.text || options.html.substring(0, 100)
      })
      return true
    }

    // TODO: Implement actual email sending
    // Example with Resend (recommended for Next.js):
    /*
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    await resend.emails.send({
      from: 'Uruziga <noreply@uruziga.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    */

    // Example with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
    await sgMail.send({
      to: options.to,
      from: 'noreply@uruziga.com',
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    */

    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Send OTP verification email
 */
export async function sendVerificationEmail(email: string, otp: string, fullName?: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Uruziga</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #F3E5AB 0%, #E8D89E 100%);
          border-radius: 10px;
          padding: 40px;
          text-align: center;
        }
        .logo {
          width: 80px;
          height: 80px;
          background: #8B4513;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F3E5AB;
          font-size: 36px;
          font-weight: bold;
        }
        h1 {
          color: #8B4513;
          margin-bottom: 10px;
        }
        .otp-code {
          background: white;
          border: 3px solid #8B4513;
          border-radius: 10px;
          padding: 20px;
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #8B4513;
          margin: 30px 0;
        }
        .message {
          color: #D2691E;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #8B4513;
          font-size: 14px;
          color: #8B4513;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">U</div>
        <h1>Welcome to Uruziga!</h1>
        ${fullName ? `<p class="message">Hello ${fullName},</p>` : ''}
        <p class="message">Thank you for joining the Umwero learning community. Please verify your email address to complete your registration.</p>
        
        <div class="otp-code">${otp}</div>
        
        <p class="message">Enter this code on the verification page to activate your account.</p>
        
        <div class="warning">
          <strong>⚠️ Security Notice:</strong><br>
          This code will expire in 10 minutes. Never share this code with anyone.
        </div>
        
        <div class="footer">
          <p>If you didn't create an account with Uruziga, please ignore this email.</p>
          <p><strong>Uruziga</strong> - Preserving Kinyarwanda Culture Through Umwero</p>
          <p>Made with ❤️ in Rwanda</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Welcome to Uruziga!

Your verification code is: ${otp}

This code will expire in 10 minutes. Enter it on the verification page to activate your account.

If you didn't create an account with Uruziga, please ignore this email.

Uruziga - Preserving Kinyarwanda Culture Through Umwero
Made with ❤️ in Rwanda
  `

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Uruziga',
    html,
    text
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string, fullName?: string): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Uruziga</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #F3E5AB 0%, #E8D89E 100%);
          border-radius: 10px;
          padding: 40px;
          text-align: center;
        }
        .logo {
          width: 80px;
          height: 80px;
          background: #8B4513;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-center;
          color: #F3E5AB;
          font-size: 36px;
          font-weight: bold;
        }
        h1 {
          color: #8B4513;
          margin-bottom: 10px;
        }
        .button {
          display: inline-block;
          background: #8B4513;
          color: #F3E5AB;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .message {
          color: #D2691E;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #8B4513;
          font-size: 14px;
          color: #8B4513;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">U</div>
        <h1>Reset Your Password</h1>
        ${fullName ? `<p class="message">Hello ${fullName},</p>` : ''}
        <p class="message">We received a request to reset your password. Click the button below to create a new password.</p>
        
        <a href="${resetUrl}" class="button">Reset Password</a>
        
        <p class="message">This link will expire in 1 hour.</p>
        
        <div class="footer">
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p><strong>Uruziga</strong> - Preserving Kinyarwanda Culture Through Umwero</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Reset Your Password

Hello ${fullName || ''},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

Uruziga - Preserving Kinyarwanda Culture Through Umwero
  `

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - Uruziga',
    html,
    text
  })
}

/**
 * Send welcome email after successful verification
 */
export async function sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Uruziga!</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #F3E5AB 0%, #E8D89E 100%);
          border-radius: 10px;
          padding: 40px;
          text-align: center;
        }
        .logo {
          width: 80px;
          height: 80px;
          background: #8B4513;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F3E5AB;
          font-size: 36px;
          font-weight: bold;
        }
        h1 {
          color: #8B4513;
          margin-bottom: 10px;
        }
        .message {
          color: #D2691E;
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          background: #8B4513;
          color: #F3E5AB;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #8B4513;
          font-size: 14px;
          color: #8B4513;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">U</div>
        <h1>🎉 Welcome to Uruziga, ${fullName}!</h1>
        <p class="message">Your email has been verified successfully. You're now part of the Umwero learning community!</p>
        
        <p class="message">Start your journey to master the Umwero alphabet and preserve Kinyarwanda culture.</p>
        
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/learn" class="button">Start Learning</a>
        
        <div class="footer">
          <p><strong>What's Next?</strong></p>
          <p>✓ Complete your profile<br>
          ✓ Start with vowel lessons<br>
          ✓ Join the community discussions<br>
          ✓ Track your progress</p>
          <p style="margin-top: 20px;"><strong>Uruziga</strong> - Preserving Kinyarwanda Culture Through Umwero</p>
          <p>Made with ❤️ in Rwanda</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: '🎉 Welcome to Uruziga!',
    html
  })
}
