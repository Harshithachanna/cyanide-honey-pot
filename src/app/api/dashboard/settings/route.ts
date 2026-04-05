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
    .from('tenants')
    .select('api_key, slack_webhook_url')
    .eq('id', profile.tenant_id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const { profile } = await getUserAndRole();
  if (!profile || profile.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slack_webhook_url } = await req.json();
    const supabase = createClient();
    
    // We only allow updating the slack_webhook_url in this route for simplicity
    const { error } = await supabase
      .from('tenants')
      .update({ slack_webhook_url })
      .eq('id', profile.tenant_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
