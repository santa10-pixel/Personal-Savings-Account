import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET!;

    // Verify signature (skip if mock order)
    if (!razorpay_order_id.startsWith("mock_order_")) {
      const shasum = crypto.createHmac("sha256", secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest("hex");

      if (digest !== razorpay_signature) {
        return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
      }
    }

    // Update payment and order status in the database
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: {
        order: {
          include: {
            orderItems: true
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    // Prepare operations for Prisma transaction
    const operations: any[] = [];

    operations.push(
      prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "COMPLETED",
          method: "UPI/Card", // we could fetch from Razorpay API for specifics
        }
      })
    );

    operations.push(
      prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PAID"
        }
      })
    );

    // Decrement stock for each product
    if (payment.order && payment.order.orderItems) {
      for (const item of payment.order.orderItems) {
        operations.push(
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        );
      }
    }

    // Execute all operations in a transaction
    await prisma.$transaction(operations);

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
