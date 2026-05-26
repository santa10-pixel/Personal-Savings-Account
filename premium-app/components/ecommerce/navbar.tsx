"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, User, Heart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store";
import Link from "next/link";

interface NavbarProps {
  onOpenCart: () => void;
  onOpenAuth: () => void;
}

export function Navbar({ onOpenCart, onOpenAuth }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartItemsCount = useCartStore((state) => state.cartTotalItems());

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-6 transition-all duration-500",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="flex items-center gap-6">
        <button className="lg:hidden text-foreground">
          <Menu className="h-6 w-6" />
        </button>
        <a href="#" className="font-heading text-2xl font-bold tracking-tight text-foreground">
          AURA.
        </a>
        <nav className="hidden lg:flex items-center gap-8 ml-8">
          {["Men", "Women", "Kids", "New Arrivals", "Sale"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className="h-10 w-64 rounded-full border border-border bg-background/50 pl-10 pr-4 text-sm transition-all focus:w-80 focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background"
          />
        </div>
        
        <button className="text-foreground hover:text-accent transition-colors">
          <Heart className="h-5 w-5" />
        </button>
        <Link href="/login" className="text-foreground hover:text-accent transition-colors">
          <User className="h-5 w-5" />
        </Link>
        <button 
          className="relative text-foreground hover:text-accent transition-colors"
          onClick={onOpenCart}
        >
          <ShoppingBag className="h-5 w-5" />
          {mounted && cartItemsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
              {cartItemsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
