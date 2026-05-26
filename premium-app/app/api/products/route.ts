import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rawProducts = await prisma.product.findMany();
    
    // Parse the JSON stringified arrays back into real arrays
    const products = rawProducts.map((p) => ({
      ...p,
      images: JSON.parse(p.images),
      colors: JSON.parse(p.colors),
      sizes: JSON.parse(p.sizes),
      styleTags: p.styleTags ? JSON.parse(p.styleTags) : undefined,
    }));

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
