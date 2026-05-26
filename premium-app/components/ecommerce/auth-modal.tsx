"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Smartphone, ArrowRight } from "lucide-react";
import { PremiumInput } from "@/components/ui/premium-input";
import { AnimatedButton } from "@/components/ui/animated-button";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [method, setMethod] = useState<"email" | "phone">("email");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card/80 p-8 shadow-2xl backdrop-blur-xl border border-border"
          >
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8 text-center">
              <h2 className="font-heading text-3xl font-medium text-foreground">
                {tab === "login" ? "Welcome Back" : "Join AURA"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {tab === "login" ? "Sign in to access your premium account." : "Create an account for exclusive access."}
              </p>
            </div>

            <div className="mb-6 flex rounded-full bg-secondary/50 p-1 backdrop-blur-sm">
              <button
                className={cn("flex-1 rounded-full py-2 text-sm font-medium transition-all", tab === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                onClick={() => setTab("login")}
              >
                Log In
              </button>
              <button
                className={cn("flex-1 rounded-full py-2 text-sm font-medium transition-all", tab === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                onClick={() => setTab("signup")}
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors", method === "email" ? "border-foreground bg-foreground/5 text-foreground" : "border-border text-muted-foreground hover:bg-secondary")}
                  onClick={() => setMethod("email")}
                >
                  <Mail className="h-4 w-4" /> Email
                </button>
                <button
                  className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors", method === "phone" ? "border-foreground bg-foreground/5 text-foreground" : "border-border text-muted-foreground hover:bg-secondary")}
                  onClick={() => setMethod("phone")}
                >
                  <Smartphone className="h-4 w-4" /> Phone
                </button>
              </div>

              {method === "email" ? (
                <PremiumInput type="email" placeholder="Email address" className="bg-background/80" />
              ) : (
                <PremiumInput type="tel" placeholder="Mobile number" className="bg-background/80" />
              )}
              
              {tab === "login" && method === "email" && (
                <PremiumInput type="password" placeholder="Password" className="bg-background/80" />
              )}

              <AnimatedButton className="w-full h-12 mt-2">
                {tab === "login" ? "Sign In" : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
              </AnimatedButton>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
                Facebook
              </button>
            </div>
            
            <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
              By continuing, you agree to Aura's <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
