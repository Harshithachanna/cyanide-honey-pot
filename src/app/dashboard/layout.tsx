import { redirect } from 'next/navigation';
import { getUserAndRole } from '@/lib/auth';
import { ShieldAlert, Activity, Settings, List, LogOut } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getUserAndRole();

  if (!user) {
    redirect('/login');
  }

  if (profile && profile.role === 'SUPER_ADMIN') {
    redirect('/admin');
  }

  if (!profile) {
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  const supabase = createClient();
  const { data: tenant } = await supabase
    .from('tenants')
    .select('company_name')
    .eq('id', profile.tenant_id)
    .single();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border/40 bg-card/20 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-border/40">
          <div className="h-7 w-7 rounded-lg bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mr-2.5">
            <ShieldAlert className="h-3.5 w-3.5 text-neon-green" />
          </div>
          <span className="font-bold tracking-tight text-sm">Honeypot</span>
        </div>

        <div className="px-5 py-3 border-b border-border/30">
          <div className="text-[10px] text-muted uppercase tracking-widest font-semibold">Client</div>
          <div className="text-sm font-medium text-white mt-0.5 truncate">{tenant?.company_name || '—'}</div>
        </div>

        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-card/60 hover:text-white transition-colors text-muted">
            <Activity className="h-3.5 w-3.5" /> Overview
          </Link>
          <Link href="/dashboard/incidents" className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-card/60 hover:text-white transition-colors text-muted">
            <List className="h-3.5 w-3.5" /> Incidents
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-card/60 hover:text-white transition-colors text-muted">
            <Settings className="h-3.5 w-3.5" /> Settings
          </Link>
        </nav>

        <div className="p-3 border-t border-border/30 mt-auto">
          <form action={async () => {
             "use server";
             const sb = createClient();
             await sb.auth.signOut();
             redirect('/login');
          }}>
            <button className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium rounded-lg hover:bg-red-900/20 text-muted hover:text-neon-red transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
