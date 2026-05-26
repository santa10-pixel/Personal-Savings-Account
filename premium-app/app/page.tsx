"use client";

import { useState, useEffect } from "react";
import { FadeIn } from "@/components/ui/fade-in";
import { StaggerReveal, StaggerItem } from "@/components/ui/stagger-reveal";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Navbar } from "@/components/ecommerce/navbar";
import { ProductCard } from "@/components/ecommerce/product-card";
import { CartSidebar } from "@/components/ecommerce/cart-sidebar";
import { AuthModal } from "@/components/ecommerce/auth-modal";
import { SizeGuide } from "@/components/ecommerce/size-guide";
import { Product } from "@/lib/mock-data";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
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

  const menProducts = products.filter((p) => p.category === "Men");
  const womenProducts = products.filter((p) => p.category === "Women");
  const kidsProducts = products.filter((p) => p.category === "Kids");
  const activewearProducts = products.filter((p) => p.category === "Activewear");
  const streetwearProducts = products.filter((p) => p.category === "Streetwear");

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent/20">
      <Navbar onOpenCart={() => setIsCartOpen(true)} onOpenAuth={() => setIsAuthOpen(true)} />
      
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative h-[90vh] min-h-[600px] w-full overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80" 
            alt="Fashion Hero" 
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          
          <div className="absolute inset-0 flex items-center px-6 md:px-16 lg:px-24">
            <div className="max-w-2xl">
              <FadeIn yOffset={30}>
                <span className="text-sm font-bold tracking-widest text-warm-accent uppercase mb-4 block">New Season</span>
              </FadeIn>
              <FadeIn delay={0.1} yOffset={30}>
                <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-medium text-white leading-[1.1] mb-6">
                  Elevate Your <br /> Everyday.
                </h1>
              </FadeIn>
              <FadeIn delay={0.2} yOffset={30}>
                <p className="text-lg text-white/80 max-w-md mb-10 leading-relaxed">
                  Discover the latest collection of premium minimal wear designed for modern life. Cinematic aesthetics meets comfort.
                </p>
              </FadeIn>
              <FadeIn delay={0.3} yOffset={30}>
                <Link href="/shop">
                  <AnimatedButton className="h-14 px-8 text-base bg-white text-black hover:bg-white/90">
                    Shop New Arrivals <ArrowRight className="ml-2 h-4 w-4" />
                  </AnimatedButton>
                </Link>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Categories Carousel / Grid */}
        <section className="py-20 px-6 md:px-16 lg:px-24 bg-card/30">
          <FadeIn>
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-heading text-3xl font-medium text-foreground">Explore Categories</h2>
            </div>
          </FadeIn>
          
          <StaggerReveal className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {["Sportswear", "Streetwear", "Sneakers", "Accessories", "Ethnic Wear", "Sale"].map((cat) => (
              <StaggerItem key={cat}>
                <Link href={cat === "Sale" ? "#sale" : `/category/${cat.toLowerCase().replace(" ", "-")}`}>
                  <div className="group cursor-pointer rounded-2xl bg-card p-6 border border-border transition-all hover:border-accent/50 hover:shadow-md flex flex-col items-center justify-center gap-3 h-32">
                    <span className="font-medium text-foreground text-sm group-hover:text-accent transition-colors">{cat}</span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </section>

        {/* Men's Section */}
        <section id="men" className="py-24 px-6 md:px-16 lg:px-24">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-sm font-bold tracking-widest text-accent uppercase mb-2 block">Curated For Him</span>
                <h2 className="font-heading text-4xl font-medium text-foreground">Men's Collection</h2>
              </div>
              <button className="hidden sm:flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors pb-1">
                View All Men <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </FadeIn>

          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {menProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />
              </StaggerItem>
            ))}
          </StaggerReveal>
        </section>
        
        {/* Streetwear Section */}
        <section id="streetwear" className="py-24 px-6 md:px-16 lg:px-24 bg-card/20">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-sm font-bold tracking-widest text-accent uppercase mb-2 block">Urban Elements</span>
                <h2 className="font-heading text-4xl font-medium text-foreground">Streetwear</h2>
              </div>
              <button className="hidden sm:flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors pb-1">
                View All Streetwear <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </FadeIn>

          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {streetwearProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />
              </StaggerItem>
            ))}
          </StaggerReveal>
        </section>

        {/* Promotional Banner */}
        <section className="py-12 px-6 md:px-16 lg:px-24">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl bg-foreground text-background py-16 px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-warm-accent via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-xl">
                <span className="text-sm font-bold tracking-widest text-warm-accent uppercase mb-2 block">Limited Time Offer</span>
                <h2 className="font-heading text-4xl md:text-5xl font-medium mb-4">Summer Sale. Up to 40% Off.</h2>
                <p className="text-background/70 mb-8">Upgrade your wardrobe with our premium collection before stock runs out.</p>
                <AnimatedButton className="bg-background text-foreground hover:bg-background/90 h-12 px-8">
                  Shop the Sale
                </AnimatedButton>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Sale Section */}
        <section id="sale" className="py-24 px-6 md:px-16 lg:px-24">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-sm font-bold tracking-widest text-destructive uppercase mb-2 block">Don't Miss Out</span>
                <h2 className="font-heading text-4xl font-medium text-foreground">Sale Offers</h2>
              </div>
              <button className="hidden sm:flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors pb-1">
                View All Sale <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </FadeIn>

          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.filter(p => p.offerPercentage > 30).slice(0, 4).map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />
              </StaggerItem>
            ))}
          </StaggerReveal>
        </section>

        {/* Women's Section */}
        <section id="women" className="py-24 px-6 md:px-16 lg:px-24 bg-card/10">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-sm font-bold tracking-widest text-accent uppercase mb-2 block">Curated For Her</span>
                <h2 className="font-heading text-4xl font-medium text-foreground">Women's Collection</h2>
              </div>
              <button className="hidden sm:flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors pb-1">
                View All Women <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </FadeIn>

          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {womenProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />
              </StaggerItem>
            ))}
          </StaggerReveal>
        </section>

        {/* Activewear Section */}
        <section id="activewear" className="py-24 px-6 md:px-16 lg:px-24">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-sm font-bold tracking-widest text-accent uppercase mb-2 block">High Performance</span>
                <h2 className="font-heading text-4xl font-medium text-foreground">Activewear</h2>
              </div>
              <button className="hidden sm:flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors pb-1">
                View All Activewear <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </FadeIn>

          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {activewearProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />
              </StaggerItem>
            ))}
          </StaggerReveal>
        </section>
        
        {/* Kids Section */}
        <section id="kids" className="py-24 px-6 md:px-16 lg:px-24 bg-card/10">
          <FadeIn>
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-sm font-bold tracking-widest text-accent uppercase mb-2 block">Playful & Premium</span>
                <h2 className="font-heading text-4xl font-medium text-foreground">Kids Collection</h2>
              </div>
              <button className="hidden sm:flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors pb-1">
                View All Kids <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </FadeIn>

          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {kidsProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} onOpenSizeGuide={() => setIsSizeGuideOpen(true)} />
              </StaggerItem>
            ))}
          </StaggerReveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card py-16 px-6 md:px-16 lg:px-24 border-t border-border mt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground mb-6">AURA.</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium fashion for the modern era. Quiet luxury meets futuristic minimalism.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-6">Shop</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#men" className="hover:text-foreground transition-colors">Men</a></li>
              <li><a href="#women" className="hover:text-foreground transition-colors">Women</a></li>
              <li><a href="#kids" className="hover:text-foreground transition-colors">Kids</a></li>
              <li><a href="#activewear" className="hover:text-foreground transition-colors">Activewear</a></li>
              <li><a href="#streetwear" className="hover:text-foreground transition-colors">Streetwear</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Order Tracking</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border text-sm text-muted-foreground">
          <p>© 2026 AURA Fashion. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span>Instagram</span>
            <span>Twitter</span>
            <span>Pinterest</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
