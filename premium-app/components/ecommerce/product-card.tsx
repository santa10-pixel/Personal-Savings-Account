"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Star, Ruler } from "lucide-react";
import { Product } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store";

interface ProductCardProps {
  product: Product;
  onOpenSizeGuide?: () => void;
}

export function ProductCard({ product, onOpenSizeGuide }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (selectedSize) {
      addItem(product, selectedSize);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } else {
      alert("Please select a size first.");
    }
  };

  return (
    <div 
      className="group relative flex flex-col gap-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-secondary/50">
        <motion.img
          src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.offerPercentage > 0 && (
            <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background shadow-sm">
              -{product.offerPercentage}%
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground shadow-sm">
              Sold Out
            </span>
          )}
        </div>

        <button className="absolute right-3 top-3 rounded-full bg-background/50 p-2 text-foreground backdrop-blur-md transition-colors hover:bg-background hover:text-destructive">
          <Heart className="h-4 w-4" />
        </button>

        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && !isOutOfStock && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-3 left-3 right-3 flex flex-col gap-2 rounded-xl bg-background/80 p-3 backdrop-blur-md border border-border"
            >
              <div className="flex justify-between items-center px-1 mb-1">
                <span className="text-xs font-medium text-muted-foreground">Select Size</span>
                {onOpenSizeGuide && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onOpenSizeGuide(); }}
                    className="flex items-center gap-1 text-[10px] font-semibold uppercase text-foreground hover:text-accent transition-colors"
                  >
                    <Ruler className="h-3 w-3" /> Size Guide
                  </button>
                )}
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
                      selectedSize === size
                        ? "bg-foreground text-background"
                        : "bg-background text-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={isAdded}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all mt-1",
                  isAdded 
                    ? "bg-green-600 text-white" 
                    : "bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                {isAdded ? (
                  <>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      Added!
                    </motion.div>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">{product.brand}</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-warm-accent text-warm-accent" />
            <span className="text-xs font-medium text-muted-foreground">{product.rating}</span>
          </div>
        </div>
        <h3 className="font-heading text-lg font-medium text-foreground leading-tight truncate">
          {product.title}
        </h3>
        <p className="text-sm text-muted-foreground">{product.category} • {product.subcategory}</p>
        
        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-semibold text-foreground">₹{product.discountedPrice}</span>
          {product.originalPrice > product.discountedPrice && (
            <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
          )}
        </div>

        {isLowStock && (
          <p className="text-xs font-medium text-destructive mt-1">Only {product.stock} left in stock!</p>
        )}
      </div>
    </div>
  );
}
