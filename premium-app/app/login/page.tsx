"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PremiumInput } from "@/components/ui/premium-input";
import { cn } from "@/lib/utils";

function LoginForm() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/shop";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = tab === "login" ? { email, password } : { email, password, name };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(next);
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8 text-center">
        <h2 className="font-heading text-3xl font-medium text-foreground">
          {tab === "login" ? "Welcome Back" : "Join AURA"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {tab === "login" ? "Sign in to access your premium account." : "Create an account for exclusive access."}
        </p>
      </div>

      <div className="mb-6 flex rounded-full bg-background/50 p-1 backdrop-blur-sm">
        <button
          className={cn("flex-1 rounded-full py-2 text-sm font-medium transition-all", tab === "login" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
          onClick={() => { setTab("login"); setError(""); }}
        >
          Log In
        </button>
        <button
          className={cn("flex-1 rounded-full py-2 text-sm font-medium transition-all", tab === "signup" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
          onClick={() => { setTab("signup"); setError(""); }}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === "signup" && (
          <PremiumInput 
            type="text" 
            placeholder="Full Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        )}
        
        <PremiumInput 
          type="email" 
          placeholder="Email address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        
        <PremiumInput 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />

        {error && (
          <p className="text-sm text-red-500 text-center bg-red-500/10 py-2 rounded-md border border-red-500/20">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-4 rounded-xl bg-foreground text-background font-medium text-base transition-all hover:bg-foreground/90 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? "Processing..." : tab === "login" ? "Sign In" : "Continue"} {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 selection:bg-accent/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-secondary/30 p-8 shadow-2xl backdrop-blur-xl border border-border"
      >
        <Suspense fallback={<div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>}>
          <LoginForm />
        </Suspense>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-secondary px-2 text-muted-foreground rounded-full">Secure Authentication</span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
          By continuing, you agree to Aura's <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
