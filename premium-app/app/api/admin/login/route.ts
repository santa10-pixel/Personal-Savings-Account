import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // In a real app, query the database. For demo, we might auto-create an admin if none exists
    let admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    
    if (!admin) {
      // Create default admin on first login attempt if none exists
      const hashedPassword = await bcrypt.hash("admin123", 10);
      admin = await prisma.user.create({
        data: {
          email: "admin@example.com",
          password: hashedPassword,
          role: "ADMIN",
          name: "Admin User"
        }
      });
    }

    if (email !== admin.email) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: admin.id, role: admin.role, email: admin.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({ success: true });
    
    // Set cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
