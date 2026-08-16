import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if username or email is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Create a brand new isolated Tenant for every sign-up dynamically
    const tenant = await prisma.tenant.create({
      data: {
        name: `${username}'s Store`,
      },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    // Create inactive user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        tenantId: tenant.id,
        role: "ADMIN",
        // emailVerified remains null
      },
    });

    // Generate Verification Token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Configure Nodemailer (Google SMTP)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER, 
        pass: process.env.EMAIL_SERVER_PASSWORD, 
      },
    });

    // Construct verification URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/api/auth/verify?token=${token}`;

    const mailOptions = {
      from: `"Aavak.io" <${process.env.EMAIL_SERVER_USER}>`,
      to: email,
      subject: "Verify your Aavak.io account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Aavak.io!</h2>
          <p>Hi ${username},</p>
          <p>Thank you for registering. Please confirm your email address by clicking the link below:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #0f172a; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    };

    // Attempt to send email. In development without env vars, log the URL to console.
    if (process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD) {
      await transporter.sendMail(mailOptions);
    } else {
      console.warn("⚠️ SMTP credentials missing. Verification URL:", verificationUrl);
    }

    return NextResponse.json({ success: true, message: "User registered" }, { status: 201 });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
