"use client";

import { useEffect, useState, useMemo } from "react";
import { Download, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { jsPDF } from "jspdf";

export default function IncidentsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/detonations")
      .then(res => res.json())
      .then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => 
    data.filter(d =>
      d.attacker_ip?.includes(search) ||
      d.threat_level?.toLowerCase().includes(search.toLowerCase()) ||
      d.trap_type?.toLowerCase().includes(search.toLowerCase())
    ), [data, search]);

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Radioactive Honeypot — Incident Report", 14, 20);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toISOString()}`, 14, 28);
    doc.text(`Total incidents: ${filteredData.length}`, 14, 34);

    let y = 44;
    filteredData.forEach((d, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`#${i + 1}  [${d.threat_level}]  ${d.trap_type}`, 14, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Time: ${new Date(d.created_at).toLocaleString()}  |  IP: ${d.attacker_ip}  |  Location: ${d.attacker_city || 'N/A'}, ${d.attacker_country || 'N/A'}`, 14, y);
      y += 8;
    });
    doc.save("Honeypot_Incident_Report.pdf");
  };

  return (
    <div className="space-y-5 flex flex-col h-[calc(100vh-3rem)] animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Incident Log</h1>
          <p className="text-muted text-xs mt-0.5">{filteredData.length} records</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted" />
            <Input placeholder="Search..." className="pl-8 h-9 text-xs" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={handleExport} disabled={filteredData.length === 0}>
            <Download className="h-3.5 w-3.5" /> Export PDF
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col bg-card/20 border-border/30">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] uppercase bg-card/60 border-b border-border/30 text-muted sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 font-semibold">Timestamp</th>
                <th className="px-5 py-3 font-semibold">Threat Level</th>
                <th className="px-5 py-3 font-semibold">Trap Type</th>
                <th className="px-5 py-3 font-semibold">Attacker IP</th>
                <th className="px-5 py-3 font-semibold">Location</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted text-xs animate-pulse">Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted text-xs">No incidents found</td></tr>
              ) : (
                filteredData.map((d: any) => (
                  <tr key={d.id} className="border-b border-border/20 hover:bg-card/20 transition-colors">
                    <td className="px-5 py-3 font-mono text-muted text-[11px]">{new Date(d.created_at).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <Badge variant={d.threat_level === 'CRITICAL' ? 'danger' : d.threat_level === 'MEDIUM' ? 'warning' : 'success'} className="text-[10px]">
                        {d.threat_level}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-white">{d.trap_type}</td>
                    <td className="px-5 py-3 font-mono text-neon-cyan text-xs">{d.attacker_ip}</td>
                    <td className="px-5 py-3 text-muted text-[11px]">{d.attacker_city ? `${d.attacker_city}, ${d.attacker_country}` : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
