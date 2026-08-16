import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@example.com" }
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin already exists. Go log in." });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const tenant = await prisma.tenant.create({
      data: {
        name: "Cipher 0",
        address: "123 Default St",
        phone: "555-1234",
        users: {
          create: {
            email: "admin@example.com",
            name: "Manav Gami",
            password: hashedPassword,
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Database seeded successfully.", 
      tenantId: tenant.id 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}