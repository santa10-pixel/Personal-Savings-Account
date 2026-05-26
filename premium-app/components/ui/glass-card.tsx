import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50",
          "shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.02)]",
          "transition-all duration-500 ease-out hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.04)]",
          "p-8",
          className
        )}
        {...props}
      >
        {/* Subtle inner glow for premium feel */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 dark:ring-white/5 pointer-events-none" />
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";
