import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // Check expiration
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Token has expired. Please request a new one." }, { status: 400 });
    }

    // Update user
    const user = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: {
        emailVerified: new Date(),
      },
    });

    // Clean up used token
    await prisma.verificationToken.delete({ where: { token } });

    // Send welcome email
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_SERVER_USER, 
          pass: process.env.EMAIL_SERVER_PASSWORD, 
        },
      });

      const mailOptions = {
        from: `"Aavak.io" <${process.env.EMAIL_SERVER_USER}>`,
        to: user.email,
        subject: "Welcome to Aavak.io! Your account is verified.",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0f172a;">Your email is successfully verified!</h2>
            <p>Hi ${user.username},</p>
            <p>Welcome to <strong>Aavak.io</strong>! Your account is now fully activated and you're ready to get started.</p>
            <p>Log in to access your dashboard, manage your inventory, and start billing your customers seamlessly.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" style="display: inline-block; padding: 12px 24px; color: white; background-color: #0f172a; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Go to Login
              </a>
            </div>
            <p style="font-size: 14px; color: #475569;">We're thrilled to have you onboard.</p>
            <p style="font-size: 14px; color: #475569;">— The Aavak.io Team</p>
          </div>
        `,
      };

      if (process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD) {
        await transporter.sendMail(mailOptions);
      } else {
        console.warn("⚠️ SMTP credentials missing. Welcome email not sent.");
      }
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // We don't want to throw here, because the user is already verified
    }

    // Redirect to login with success param
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/login?verified=true`);
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
