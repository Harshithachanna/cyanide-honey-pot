"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ClientLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-green/4 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm z-10 p-6 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl glass border-neon-green/20 flex items-center justify-center mb-5 glow-green">
            <Lock className="h-6 w-6 text-neon-green" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Client Portal</h1>
          <p className="text-xs text-muted mt-1.5">Sign in with your assigned credentials</p>
        </div>

        <form onSubmit={handleLogin} className="glass p-7 rounded-2xl space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted font-semibold">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted font-semibold">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-neon-red bg-red-900/15 border border-neon-red/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted/50">
          Don&apos;t have an account?{" "}
          <Link href="/#request-access" className="text-neon-green/70 hover:text-neon-green transition-colors">
            Request access
          </Link>
        </p>
      </div>
    </div>
  );
}
