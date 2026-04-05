"use client";

import { useState } from "react";
import { ShieldAlert, Crosshair, Map, Activity, ChevronRight, CheckCircle2, Zap, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export default function LandingPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      companyName: formData.get("companyName"),
      websiteUrl: formData.get("websiteUrl"),
      contactEmail: formData.get("contactEmail"),
    };

    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (res.ok) {
        setStatus("success");
      } else {
        const errorData = await res.json();
        setErrorMessage(errorData.error || "Failed to submit application.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Network error. Please try again later.");
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-6 lg:px-12 h-16 flex items-center justify-between border-b border-border/40 bg-background/90 backdrop-blur-lg sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-neon-green/10 border border-neon-green/20 flex items-center justify-center group-hover:bg-neon-green/20 transition-colors">
            <ShieldAlert className="h-4 w-4 text-neon-green" />
          </div>
          <span className="font-bold text-base tracking-tight">
            Radioactive<span className="text-neon-green">Honeypot</span>
          </span>
        </Link>
        <div />
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="w-full pt-24 pb-20 md:pt-36 md:pb-28 px-6 relative overflow-hidden flex flex-col items-center text-center">
          {/* Background effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-radial from-neon-green/8 via-transparent to-transparent blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-neon-cyan/5 via-transparent to-transparent blur-3xl pointer-events-none" />

          <div className="animate-fade-in inline-flex items-center rounded-full bg-neon-green/5 border border-neon-green/15 px-4 py-1.5 text-xs font-semibold text-neon-green mb-8 tracking-wide uppercase">
            <span className="flex h-1.5 w-1.5 rounded-full bg-neon-green mr-2 animate-glow-pulse"></span>
            Enterprise Threat Intelligence
          </div>

          <h1 className="animate-slide-up text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 leading-[1.1]">
            Make your infrastructure{" "}
            <span className="text-gradient">radioactive</span>{" "}
            to attackers
          </h1>

          <p className="animate-slide-up text-base md:text-lg text-muted max-w-xl mb-12 leading-relaxed" style={{ animationDelay: "100ms" }}>
            Deploy invisible honeypot traps across your application. When attackers interact with them, we capture their identity, location, and tactics — in real time.
          </p>

          <div className="animate-fade-in flex flex-col sm:flex-row gap-4 items-center justify-center" style={{ animationDelay: "200ms" }}>
            <a href="#request-access">
              <Button variant="neon" className="h-12 px-10 text-sm font-bold uppercase tracking-widest">
                Request Access <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href="/login">
              <Button variant="outline" className="h-12 px-10 text-sm font-bold uppercase tracking-widest border-white/10 hover:border-white/20">
                Client Portal
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-24 px-6 border-y border-border/40 bg-card/10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Enterprise Defense Layers</h2>
              <p className="text-muted-foreground text-base max-w-md mx-auto">Engineered to neutralize sophisticated attackers before they penetrate your core.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Crosshair,
                  title: "Ghost URL Traps",
                  desc: "Deploy invisible endpoints in your code. Only malicious scanners and scrapers discover these ghost routes.",
                  color: "neon-cyan",
                },
                {
                  icon: Zap,
                  title: "Decoy API Keys",
                  desc: "Embed inactive Stripe or AWS credentials in your repository. Any copy attempt triggers a critical SOC alert.",
                  color: "neon-green",
                },
                {
                  icon: Globe,
                  title: "Toxic Metadata",
                  desc: "Confidential-looking files with tracking beacons designed to snare manual intrusion attempts.",
                  color: "neon-red",
                },
              ].map((item) => (
                <div key={item.title} className="glass rounded-xl p-8 hover:border-white/20 transition-all duration-500 group">
                  <div className={`h-12 w-12 rounded-lg bg-${item.color}/10 border border-${item.color}/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6" style={{ color: `var(--${item.color})` }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Request Access Form */}
        <section id="request-access" className="w-full py-32 px-6 flex justify-center bg-gradient-to-b from-card/30 to-background/50">
          <div className="max-w-lg w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tighter">Request Access</h2>
              <p className="text-muted-foreground text-base">Vetted security teams only. Inquire for a private deployment key.</p>
            </div>

            {status === "success" ? (
              <div className="glass p-12 rounded-2xl flex flex-col items-center text-center border-neon-green/30 glow-green animate-fade-in shadow-2xl">
                <CheckCircle2 className="h-16 w-16 text-neon-green mb-6" />
                <h3 className="text-2xl font-extrabold mb-3">Submission Received</h3>
                <p className="text-muted-foreground text-base leading-relaxed">Our infrastructure team is reviewing your application. Expect a briefing via your secure contact email within 24 hours.</p>
              </div>
            ) : (
              <div className="glass p-10 rounded-2xl shadow-2xl border-white/5">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Entity Name</label>
                    <Input name="companyName" required placeholder="Spectre Global Systems" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Infrastructure URL</label>
                    <Input name="websiteUrl" type="url" required placeholder="https://spectre.io" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Secure Contact</label>
                    <Input name="contactEmail" type="email" required placeholder="security-soc@spectre.io" />
                  </div>
                  {status === "error" && (
                    <div className="text-sm text-neon-red bg-neon-red/10 border border-neon-red/20 rounded-lg px-4 py-3 font-semibold">
                      CRITICAL_ERROR: {errorMessage}
                    </div>
                  )}
                  <Button type="submit" variant="neon" className="w-full h-12 mt-4 text-xs font-black uppercase tracking-widest" disabled={status === "submitting"}>
                    {status === "submitting" ? "PROVISIONING..." : "SUBMIT_APPLICATION"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="py-6 text-center border-t border-border/40">
        <p className="text-xs text-muted/60">© {new Date().getFullYear()} The Radioactive Honeypot. All rights reserved.</p>
      </footer>
    </div>
  );
}
