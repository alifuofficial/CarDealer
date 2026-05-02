"use server";

import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { sendEmail } from "@/lib/actions/email";
import bcrypt from "bcryptjs";

export async function requestOtp(identifier: string) {
  // identifier can be email or phone
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier },
      ],
    },
  });

  if (!user) {
    // We don't reveal if user exists for security, but we return a success-like message
    return { success: true, message: "If an account exists, an OTP has been sent." };
  }

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Determine type
  const type = identifier.includes("@") ? "EMAIL" : "SMS";

  // Store OTP
  await prisma.otp.create({
    data: {
      userId: user.id,
      code,
      type,
      expiresAt,
    },
  });

  // Send OTP
  if (type === "EMAIL") {
    await sendEmail({
      to: user.email,
      subject: "Your Password Reset OTP",
      text: `Your OTP is: ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 400px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #1e293b; margin-bottom: 8px;">Reset Password</h2>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Use the following code to reset your password. Valid for 10 minutes.</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #2563eb;">${code}</span>
          </div>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  } else {
    // Send SMS
    if (user.phone) {
      await sendSMS(user.phone, `Your Soreti Car Dealer password reset OTP is: ${code}. Valid for 10 mins.`);
    }
  }

  return { success: true, userId: user.id, type };
}

export async function verifyOtpAndResetPassword(userId: string, code: string, newPassword: string) {
  const otp = await prisma.otp.findFirst({
    where: {
      userId,
      code,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new Error("Invalid or expired OTP");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Delete all OTPs for this user
  await prisma.otp.deleteMany({
    where: { userId },
  });

  return { success: true };
}
