"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { PremiumInput } from "@/components/ui/premium-input";
import { AnimatedButton } from "@/components/ui/animated-button";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 selection:bg-accent/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-border bg-secondary/30 p-10 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="h-16 w-16 rounded-full bg-foreground flex items-center justify-center mb-6">
              <Lock className="h-8 w-8 text-background" />
            </div>
            <h1 className="font-heading text-3xl font-medium text-foreground">Admin Portal</h1>
            <p className="text-muted-foreground mt-2 text-center">Secure access to AURA revenue and analytics</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <PremiumInput
              type="email"
              placeholder="Admin Email"
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
              className="w-full h-14 mt-2 rounded-xl bg-foreground text-background font-medium text-base transition-all hover:bg-foreground/90 disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
