"use client";

import { useState, useEffect } from "react";
import { Copy, Save, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [webhook, setWebhook] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hostUrl, setHostUrl] = useState("");

  useEffect(() => {
    setHostUrl(window.location.origin);
    fetch("/api/dashboard/settings")
      .then(res => res.json())
      .then(data => {
        setApiKey(data.api_key || "");
        setWebhook(data.slack_webhook_url || "");
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/dashboard/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slack_webhook_url: webhook })
    });
    setSaving(false);
    // Optional: show toast message here
  };

  const copySnippet = () => {
    const snippet = `<script src="${hostUrl}/honeypot.js" data-api-key="${apiKey}" defer></script>`;
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-muted text-sm animate-pulse">Loading settings...</div>;

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Deployment & Settings</h1>
          <p className="text-muted text-xs mt-0.5">Configure your integration and alert channels.</p>
        </div>
      </div>

      <Card className="border-neon-cyan/20 shadow-[0_0_20px_rgba(0,240,255,0.05)] bg-card/40">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="text-sm font-bold">Deployment Snippet</CardTitle>
          <CardDescription className="text-xs">Place this script block immediately before the closing <code className="text-white">&lt;/body&gt;</code> tag on your application to arm the traps.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="relative group">
            <pre className="p-3.5 rounded-xl bg-[#09090b] font-mono text-xs text-neon-green overflow-x-auto border border-border/50">
              {`<script src="${hostUrl}/honeypot.js"\n        data-api-key="${apiKey}"\n        defer></script>`}
            </pre>
            <Button 
              size="sm" 
              className="absolute top-2 right-2 h-7 px-3 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
              onClick={copySnippet}
            >
              {copied ? "Copied!" : <><Copy className="h-3 w-3 mr-1.5" /> Copy Code</>}
            </Button>
          </div>
          
          <div className="p-3.5 rounded-xl bg-red-900/10 border border-red-900/30 flex gap-3 text-[11px] items-center">
            <AlertCircle className="h-4 w-4 text-neon-red shrink-0" />
            <div className="text-muted leading-tight border-l border-red-900/40 pl-3">
              <strong className="text-white block mb-0.5">Critical Security Warning</strong> 
              Keep your API key secure. It uniquely identifies your tenant for incoming threat telemetry.
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/20 border-border/30">
        <CardHeader className="pb-3 border-b border-border/20">
          <CardTitle className="text-sm font-bold">Slack Integration</CardTitle>
          <CardDescription className="text-xs">Receive real-time detonation alerts directly in your Slack workspace.</CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">Slack Webhook URL</label>
            <Input 
              type="url" 
              className="h-9 text-xs"
              placeholder="https://hooks.slack.com/services/T000000/B000000/XXXX" 
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-neon-cyan text-black hover:bg-neon-cyan/90 text-xs h-8 px-4">
              {saving ? "Saving..." : <><Save className="h-3.5 w-3.5 mr-1.5" /> Save Configuration</>}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card/20 border-border/30">
        <CardHeader className="pb-3 border-b border-border/20">
          <CardTitle className="text-sm font-bold">API Intelligence Key</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Input readOnly value={apiKey} className="font-mono text-muted bg-[#09090b] border-border/50 h-9 text-xs" />
        </CardContent>
      </Card>
    </div>
  );
}
