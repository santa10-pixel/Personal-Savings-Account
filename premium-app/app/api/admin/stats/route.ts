import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// Middleware to verify admin token
function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "ADMIN") return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const admin = verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Total revenue
    const paidOrders = await prisma.order.findMany({
      where: { status: "PAID" },
      select: { totalAmount: true, createdAt: true }
    });

    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = await prisma.order.count();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysOrders = await prisma.order.findMany({
      where: { 
        createdAt: { gte: today },
        status: "PAID"
      }
    });
    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 2. Orders list (Recent)
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        payment: true,
        orderItems: {
          include: { product: true }
        }
      }
    });

    // 3. Simple chart data (Last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);

      const dayOrders = await prisma.order.findMany({
        where: {
          status: "PAID",
          createdAt: { gte: d, lt: nextDay }
        }
      });
      
      chartData.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      });
    }

    return NextResponse.json({
      totalRevenue,
      todaysRevenue,
      totalOrders,
      recentOrders,
      chartData
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
