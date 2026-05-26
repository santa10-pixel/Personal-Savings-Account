import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerName, customerEmail, customerPhone } = body;
    
    const totalAmount = body.totalAmount;
    
    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    const orderItemsData = [];
    
    for (const item of items) {
      orderItemsData.push({
        productId: item.id,
        quantity: item.quantity,
        price: item.price || 0
      });
    }

    if (totalAmount === 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    // 1. Create Razorpay order (or mock it if keys are placeholders)
    let razorpayOrderId = `mock_order_${Date.now()}`;
    let amount = Math.round(totalAmount * 100); // Amount in paise
    let currency = "INR";

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== "rzp_test_replace_me") {
      const options = {
        amount: amount,
        currency: currency,
        receipt: `rcpt_${Date.now()}`,
      };
      const razorpayOrder = await razorpay.orders.create(options);
      razorpayOrderId = razorpayOrder.id;
    }
    
    // 2. Create order in our database
    const order = await prisma.order.create({
      data: {
        totalAmount: totalAmount,
        customerName: customerName || "Guest",
        customerEmail: customerEmail || "",
        customerPhone: customerPhone || "",
        status: "PENDING",
        orderItems: {
          create: orderItemsData
        },
        payment: {
          create: {
            razorpayOrderId: razorpayOrderId,
            amount: totalAmount,
            status: "PENDING"
          }
        }
      }
    });

    return NextResponse.json({
      orderId: razorpayOrderId,
      amount: amount,
      currency: currency,
      dbOrderId: order.id
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
