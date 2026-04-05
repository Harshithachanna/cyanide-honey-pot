import { redirect } from 'next/navigation';
import { getUserAndRole } from '@/lib/auth';
import { ShieldAlert, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getUserAndRole();

  if (!user) {
    redirect('/admin/login');
  }

  if (profile && profile.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  if (!profile) {
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-14 border-b border-border/40 bg-card/30 backdrop-blur-lg flex items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-neon-red/10 border border-neon-red/20 flex items-center justify-center">
            <ShieldAlert className="h-3.5 w-3.5 text-neon-red" />
          </div>
          <span className="font-bold tracking-tight text-sm">Admin Console</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-muted">{user.email}</span>
          <form action={async () => {
             "use server";
             const supabase = createClient();
             await supabase.auth.signOut();
             redirect('/admin/login');
          }}>
            <button className="text-muted hover:text-neon-red transition-colors p-1.5 rounded-md hover:bg-red-900/10">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
