import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "The Radioactive Honeypot | Threat Intelligence",
    template: "%s | The Radioactive Honeypot"
  },
  description: "Identify and neutralize attackers before they penetrate your core. Dynamic honeypots, real-time threat maps, and instant SOC alerts for modern security-first organizations.",
  openGraph: {
    title: "The Radioactive Honeypot",
    description: "Enterprise-grade threat intelligence and attacker identification.",
    url: "https://radioactivehoneypot.io",
    type: "website",
    siteName: "The Radioactive Honeypot"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Radioactive Honeypot",
    description: "Invisible traps for modern infrastructure."
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-background text-white antialiased")}>
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
