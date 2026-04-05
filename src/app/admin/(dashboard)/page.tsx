"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Search, XCircle, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tenant } from "@/types";

export default function AdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [password, setPassword] = useState("");
  const [approving, setApproving] = useState(false);
  const [newCreds, setNewCreds] = useState<{ email: string; pass: string; key: string } | null>(null);
  const [filter, setFilter] = useState("");

  const fetchTenants = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tenants");
      if (res.ok) setTenants(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  const handleApprove = async () => {
    if (!selectedTenant || !password) return;
    setApproving(true);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: selectedTenant.id, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewCreds({ email: selectedTenant.contact_email, pass: password, key: data.api_key });
        fetchTenants();
      } else {
        const err = await res.json();
        // Standardise error feedback
      }
    } catch {
      // Standardise error feedback
    } finally {
      setApproving(false);
    }
  };

  const filtered = tenants.filter(t =>
    t.company_name.toLowerCase().includes(filter.toLowerCase()) ||
    t.contact_email.toLowerCase().includes(filter.toLowerCase())
  );

  const pending = filtered.filter(t => t.status === 'PENDING');
  const approved = filtered.filter(t => t.status === 'APPROVED');

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <div className="h-10 w-10 border-2 border-neon-red/30 border-t-neon-red rounded-full animate-spin" />
      <div className="text-muted-foreground text-xs font-bold uppercase tracking-widest animate-pulse">Establishing Secure Stream...</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase">Provisioning_Queue</h1>
          <p className="text-muted-foreground text-xs font-bold mt-1.5 uppercase tracking-widest">
            {pending.length} Pending Approval <span className="mx-2 text-white/10">|</span> {approved.length} Active Nodes
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="FILTER_INFRASTRUCTURE..." 
            className="pl-10 h-11 text-[10px] font-black uppercase tracking-widest border-white/5 bg-white/[0.02]" 
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden shadow-2xl border-white/5">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] font-black uppercase tracking-widest bg-white/[0.03] border-b border-white/5 text-muted-foreground">
            <tr>
              <th className="px-6 py-5">Entity_Metadata</th>
              <th className="px-6 py-5">Secure_Contact</th>
              <th className="px-6 py-5">Status_Flag</th>
              <th className="px-6 py-5">Access_Key</th>
              <th className="px-6 py-5 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-20 text-center text-muted-foreground text-[10px] font-black uppercase tracking-widest">Zero entries detected in partition</td></tr>
            ) : (
              filtered.map(t => (
                <tr key={t.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                        <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <div className="font-bold text-white tracking-tight">{t.company_name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5 opacity-60">{t.website_url.replace('https://', '')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[11px] font-medium text-white/50">{t.contact_email}</td>
                  <td className="px-6 py-5">
                    <Badge variant={t.status === 'APPROVED' ? 'success' : t.status === 'PENDING' ? 'warning' : 'danger'}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    {t.api_key ? (
                      <code className="text-[10px] font-mono text-neon-green/70 bg-neon-green/5 px-2 py-1 rounded border border-neon-green/10 inline-block max-w-[140px] truncate">{t.api_key}</code>
                    ) : (
                      <span className="text-[10px] font-black text-white/5 tracking-widest">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {t.status === 'PENDING' ? (
                      <Button
                        size="sm"
                        variant="neon"
                        className="h-8 text-[10px] font-black uppercase tracking-widest"
                        onClick={() => { setSelectedTenant(t); setNewCreds(null); setPassword(Math.random().toString(36).slice(-10) + 'A1!'); }}
                      >
                        Approve_Node
                      </Button>
                    ) : (
                       <Button size="sm" variant="ghost" className="h-8 text-[10px] font-bold opacity-20 hover:opacity-100 uppercase tracking-widest">
                         Manage
                       </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Approve Modal */}
      {selectedTenant && !newCreds && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass p-10 rounded-3xl max-w-md w-full border-white/5 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-12 w-12 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                 <CheckCircle className="h-6 w-6 text-neon-cyan" />
               </div>
               <div>
                 <h3 className="text-xl font-black tracking-tight uppercase">Provision Node</h3>
                 <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Operational Approval Required</p>
               </div>
            </div>
            
            <div className="space-y-6 mb-10">
              <div className="space-y-1.5 px-1">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Infrastructure Entity</label>
                <div className="text-sm font-bold text-white">{selectedTenant.company_name}</div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Generated Access Secret</label>
                <Input type="text" value={password} onChange={e => setPassword(e.target.value)} className="font-mono text-xs h-12 bg-white/[0.03]" />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" className="flex-1 font-bold uppercase tracking-widest text-xs" onClick={() => setSelectedTenant(null)}>Abort</Button>
              <Button variant="neon" className="flex-1 font-black uppercase tracking-widest text-[10px]" onClick={handleApprove} disabled={approving}>
                {approving ? "ENCRYPTING..." : "CONFIRM_PROVISION"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {newCreds && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass p-12 rounded-3xl max-w-lg w-full border-neon-green/30 shadow-[0_0_50px_rgba(57,255,20,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldAlert className="h-32 w-32" />
            </div>

            <div className="flex flex-col items-center text-center mb-10">
              <div className="h-16 w-16 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mb-6 glow-green">
                <CheckCircle className="h-8 w-8 text-neon-green" />
              </div>
              <h3 className="text-2xl font-black tracking-tight uppercase">Node Provisioned Successfully</h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">Transmit credentials via secure channel only</p>
            </div>

            <div className="bg-black/60 p-8 rounded-2xl font-mono text-[11px] space-y-4 mb-8 border border-white/5 relative">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-muted-foreground font-black uppercase tracking-widest text-[9px]">Ingress Point</span>
                <span className="text-neon-cyan font-bold tracking-tight">{typeof window !== 'undefined' ? window.location.origin.replace('http://', '').replace('https://', '') : ''}/login</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-muted-foreground font-black uppercase tracking-widest text-[9px]">Identity Hash</span>
                <span className="text-white font-bold">{newCreds.email}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-muted-foreground font-black uppercase tracking-widest text-[9px]">Access Secret</span>
                <span className="text-white font-bold">{newCreds.pass}</span>
              </div>
              <div className="pt-4">
                <span className="text-muted-foreground font-black uppercase tracking-widest text-[9px] block mb-2">Primary API Key (Radioactive Token)</span>
                <div className="text-neon-green bg-neon-green/5 p-4 rounded-xl border border-neon-green/20 break-all leading-relaxed font-bold tracking-tight">
                  {newCreds.key}
                </div>
              </div>
            </div>

            <Button variant="neon" className="w-full h-14 text-xs font-black uppercase tracking-[0.2em]" onClick={() => { setSelectedTenant(null); setNewCreds(null); }}>
              TERMINATE_BRIEFING
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
