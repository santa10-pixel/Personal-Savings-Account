"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FadeIn } from "@/components/ui/fade-in";
import { StaggerReveal, StaggerItem } from "@/components/ui/stagger-reveal";
import { ProductCard } from "@/components/ecommerce/product-card";
import { Navbar } from "@/components/ecommerce/navbar";
import { CartSidebar } from "@/components/ecommerce/cart-sidebar";
import { SizeGuide } from "@/components/ecommerce/size-guide";
import { Product } from "@/lib/mock-data";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  
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
          const allProducts: Product[] = data.products;
          const filtered = allProducts.filter((p) => 
            p.category.toLowerCase() === decodedSlug || 
            p.subcategory.toLowerCase() === decodedSlug ||
            p.category.toLowerCase().replace(" ", "-") === decodedSlug
          );
          setProducts(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [decodedSlug]);

  // Capitalize the title nicely
  const title = decodedSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent/20">
      <Navbar onOpenCart={() => setIsCartOpen(true)} onOpenAuth={() => {}} />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      <main className="flex-1 pt-24 px-6 md:px-16 lg:px-24">
        <FadeIn>
          <div className="mb-6">
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Shop
            </Link>
          </div>
          <div className="mb-12 border-b border-border pb-8">
            <h1 className="font-heading text-4xl md:text-5xl font-medium text-foreground">{title}</h1>
            <p className="mt-4 text-muted-foreground text-lg">
              {loading ? "Loading..." : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading products...</div>
        ) : products.length > 0 ? (
          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-24">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />
              </StaggerItem>
            ))}
          </StaggerReveal>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="text-xl font-medium text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">We couldn't find any products in the "{title}" category.</p>
            <Link href="/shop" className="h-12 px-8 flex items-center justify-center rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors">
              Browse All Products
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
