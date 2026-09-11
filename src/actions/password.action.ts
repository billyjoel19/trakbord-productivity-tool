"use server";

import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // 👇 always return success even if user not found — prevents email enumeration
    if (!user) return { success: true };

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiresAt: expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"Trakbord" <${process.env.EMAIL_USER!}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Trakbord</h2>
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a
            href="${resetUrl}"
            style="display:inline-block; background:#6366f1; color:#fff; padding:10px 24px; border-radius:8px; text-decoration:none; margin:16px 0;"
          >
            Reset Password
          </a>
          <p style="color:#6b7280; font-size:13px;">
            This link expires in 30 minutes. If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred. Please try again." };
  }
}

export async function resetPassword({
  token,
  newPassword,
  confirmPassword,
}: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}) {
  try {
    if (newPassword !== confirmPassword) {
      return { error: "Passwords do not match." };
    }

    if (newPassword.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }

    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user) return { error: "Invalid or expired reset link." };

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      return { error: "Reset link has expired. Please request a new one." };
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null, // 👈 clear token after use
        resetTokenExpiresAt: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred. Please try again." };
  }
}
