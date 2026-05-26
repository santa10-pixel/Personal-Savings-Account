"use client";

import { useState, useEffect } from "react";
import { FadeIn } from "@/components/ui/fade-in";
import { StaggerReveal, StaggerItem } from "@/components/ui/stagger-reveal";
import { ProductCard } from "@/components/ecommerce/product-card";
import { Navbar } from "@/components/ecommerce/navbar";
import { CartSidebar } from "@/components/ecommerce/cart-sidebar";
import { SizeGuide } from "@/components/ecommerce/size-guide";
import { Product } from "@/lib/mock-data";

export default function ShopAllPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent/20">
      <Navbar onOpenCart={() => setIsCartOpen(true)} onOpenAuth={() => {}} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      <main className="flex-1 pt-24 px-6 md:px-16 lg:px-24">
        <FadeIn>
          <div className="mb-12 border-b border-border pb-8">
            <h1 className="font-heading text-4xl md:text-5xl font-medium text-foreground">All Products</h1>
            <p className="mt-4 text-muted-foreground text-lg">Browse our complete collection of premium items.</p>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading products...</div>
        ) : (
          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-24">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />
              </StaggerItem>
            ))}
          </StaggerReveal>
        )}
      </main>
    </div>
  );
}
