"use client";

import { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const supabase = createClient();

  // Sign out any existing session when this page loads
  useEffect(() => {
    supabase.auth.signOut().then(() => setReady(true));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      window.location.href = "/admin";
    }
  };

  if (!ready) return <div className="min-h-screen bg-[#050508]" />;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050508]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neon-red/3 blur-[80px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm z-10 p-6 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl glass border-neon-red/20 flex items-center justify-center mb-5 glow-red">
            <ShieldAlert className="h-6 w-6 text-neon-red" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Admin Access</h1>
          <p className="text-xs text-muted mt-1.5 font-mono">Restricted — Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="glass p-7 rounded-2xl space-y-5 border-neon-red/10">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted font-semibold">Identifier</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@honeypot.local"
              className="font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted font-semibold">Passphrase</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="font-mono"
            />
          </div>

          {error && (
            <p className="text-xs text-neon-red bg-red-900/15 border border-neon-red/20 rounded-lg px-3 py-2 font-mono">
              AUTH_ERROR: {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold bg-neon-red text-white hover:bg-neon-red/90 shadow-[0_0_15px_rgba(255,51,102,0.3)]"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Authenticate"}
          </Button>
        </form>

        <p className="mt-8 text-center text-[10px] font-mono text-muted/30 uppercase tracking-widest">
          Unauthorized access is monitored and logged
        </p>
      </div>
    </div>
  );
}
