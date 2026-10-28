import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db/mongodb';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { sendEmail } from '@/lib/services/email.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Please provide a valid email' }, { status: 400 });
    }

    const { email } = result.data;
    const db = await getDb();
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    // Consistent response prevents user enumeration
    const genericResponse = {
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions shortly.',
    };

    if (!user) {
      return NextResponse.json(genericResponse);
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          resetTokenHash: tokenHash,
          resetTokenExpires: expiresAt,
        },
      }
    );

    // Send email with reset token link
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Reset Your MST Store Password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #0A0A0A; color: #FFFFFF; border-radius: 6px;">
          <h2 style="color: #FFFFFF; font-size: 20px; font-weight: 700; margin-bottom: 12px;"><span style="color: #FF2D2D;">MST</span> Store — Password Reset</h2>
          <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.6;">We received a request to reset your password for your MST Store account.</p>
          <p style="margin: 28px 0;">
            <a href="${resetUrl}" style="background: #FF2D2D; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">
              Reset Password
            </a>
          </p>
          <p style="font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5;">This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
