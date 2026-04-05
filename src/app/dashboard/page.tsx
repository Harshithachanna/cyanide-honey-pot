"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Crosshair, AlertTriangle, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import dynamic from "next/dynamic";

const ThreatMap = dynamic(() => import("@/components/dashboard/ThreatMap"), { 
  ssr: false, 
  loading: () => <div className="h-full w-full bg-card/30 rounded-lg animate-pulse border border-border/30" /> 
});

interface DashboardData {
  total: number;
  critical: number;
  mostTargeted: string;
  recent: any[];
  allLocations: any[];
  error?: string;
}

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <div className="h-10 w-10 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      <div className="text-muted-foreground text-xs font-bold uppercase tracking-widest animate-pulse">Initialising Telemetry...</div>
    </div>
  );
  
  if (!data || data.error) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <AlertTriangle className="h-10 w-10 text-neon-red animate-pulse" />
      <div className="text-neon-red text-xs font-bold uppercase tracking-widest">Telemetry Stream Interrupted</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            THREAT_OVERVIEW
            <span className="flex h-2 w-2 rounded-full bg-neon-green animate-glow-pulse" />
          </h1>
          <p className="text-muted-foreground text-xs font-medium mt-1">Global intercept network connected and monitoring.</p>
        </div>
        <Badge variant="outline" className="border-neon-green/20 text-neon-green bg-neon-green/5">
          LIVE_STREAMING
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="group">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cumulative Intercepts</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-4xl font-black text-white tracking-tighter">{data.total}</div>
            <Activity className="h-10 w-10 text-white/5 group-hover:text-neon-green/20 transition-all duration-500" />
          </CardContent>
        </Card>

        <Card className="group border-neon-red/10 hover:border-neon-red/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Critical Intrusions</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-4xl font-black text-neon-red tracking-tighter">{data.critical}</div>
            <AlertTriangle className="h-10 w-10 text-neon-red/5 group-hover:text-neon-red/20 transition-all duration-500" />
          </CardContent>
        </Card>

        <Card className="group border-neon-cyan/10 hover:border-neon-cyan/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Primary Attack Vector</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-xl font-black text-neon-cyan tracking-tighter truncate max-w-[180px] uppercase">
              {data.mostTargeted.replace('_', ' ')}
            </div>
            <Crosshair className="h-10 w-10 text-neon-cyan/5 group-hover:text-neon-cyan/20 transition-all duration-500" />
          </CardContent>
        </Card>
      </div>

      {/* Map + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Geographic Origin Map</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-green" /> Low
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-red" /> Critical
              </div>
            </div>
          </div>
          <Card className="h-[400px] p-1 overflow-hidden">
            <ThreatMap locations={data.allLocations} />
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Recent Intelligence</h2>
          <Card className="h-[400px] border-border/20 flex flex-col">
            <CardContent className="flex-1 overflow-auto space-y-3 p-4 scrollbar-thin scrollbar-thumb-white/5">
              {data.recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <ShieldAlert className="h-8 w-8 text-white/5" />
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Scanning for threats...</p>
                </div>
              ) : (
                data.recent.map((threat: any) => (
                  <div key={threat.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all group relative overflow-hidden">
                    {threat.threat_level === 'CRITICAL' && (
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-red shadow-[0_0_10px_rgba(255,51,102,0.5)]" />
                    )}
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant={threat.threat_level === 'CRITICAL' ? 'danger' : threat.threat_level === 'MEDIUM' ? 'warning' : 'success'} className="px-1.5 py-0">
                        {threat.threat_level}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground group-hover:text-white transition-colors">
                        {new Date(threat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-white/90 mb-1 tracking-tight">{threat.attacker_ip}</div>
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{threat.trap_type.replace('_', ' ')}</span>
                      <span className="text-[10px] text-white/40">{threat.attacker_country || 'UNKNOWN'}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
