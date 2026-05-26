"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  yOffset?: number;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.8,
  className = "",
  yOffset = 20,
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98] as const, // smooth cinematic ease
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
