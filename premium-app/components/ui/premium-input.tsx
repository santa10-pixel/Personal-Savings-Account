import * as React from "react"

import { cn } from "@/lib/utils"

const PremiumInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-base shadow-sm backdrop-blur-sm transition-all duration-300",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground/50",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-border",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
PremiumInput.displayName = "PremiumInput"

export { PremiumInput }
