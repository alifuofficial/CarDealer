"use server";

import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function testSmtpConnection(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const host = formData.get("smtpHost") as string;
  const port = parseInt(formData.get("smtpPort") as string);
  const user = formData.get("smtpUser") as string;
  const pass = formData.get("smtpPassword") as string;
  const fromEmail = formData.get("smtpFromEmail") as string;
  const testRecipient = formData.get("testRecipient") as string || fromEmail;

  if (!host || !port || !user || !pass || !fromEmail) {
    throw new Error("Missing SMTP configuration fields");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  try {
    // Verify connection configuration
    await transporter.verify();

    // Send a test email
    await transporter.sendMail({
      from: `"${formData.get("smtpFromName") || "System Test"}" <${fromEmail}>`,
      to: testRecipient,
      subject: "SMTP Connection Test - Success",
      text: "If you are reading this, your SMTP configuration is working correctly.",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981;">SMTP Test Successful!</h2>
          <p>Your SMTP settings have been verified and a test email was successfully sent.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated test message from your Car Dealer Management System.</p>
        </div>
      `,
    });

    return { success: true, message: "SMTP connection verified and test email sent!" };
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    throw new Error(`SMTP Test Failed: ${error.message}`);
  }
}

export async function sendEmail({ to, subject, text, html }: { to: string, subject: string, text: string, html?: string }) {
  const config = await prisma.organization.findUnique({
    where: { id: "singleton" },
  });

  if (!config || !config.isEmailEnabled || !config.smtpHost) {
    console.warn("Email service is disabled or not configured.");
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  });

  return await transporter.sendMail({
    from: `"${config.smtpFromName}" <${config.smtpFromEmail}>`,
    to,
    subject,
    text,
    html,
  });
}
