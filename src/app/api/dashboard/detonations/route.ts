import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserAndRole } from '@/lib/auth';

export async function GET() {
  const { profile } = await getUserAndRole();
  if (!profile || profile.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('detonations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
