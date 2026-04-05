import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserAndRole } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { profile } = await getUserAndRole();
  
  if (!profile || profile.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { tenant_id, password } = await req.json();

    if (!tenant_id || !password) {
      return NextResponse.json({ error: 'Missing tenant_id or password' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Get tenant details
    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenant_id)
      .single();

    if (tenantErr || !tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    if (tenant.status === 'APPROVED') return NextResponse.json({ error: 'Already approved' }, { status: 400 });

    // 2. Generate secure API key
    const apiKey = crypto.randomBytes(32).toString('hex');

    // 3. Create user in Supabase Auth
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: tenant.contact_email,
      password: password,
      email_confirm: true,
    });

    if (authErr) {
      // If user already exists, we might need to handle it gracefully, but returning error for MVP
      return NextResponse.json({ error: authErr.message }, { status: 400 });
    }

    // 4. Create user profile
    const { error: profileErr } = await supabase
      .from('users')
      .insert([{
        auth_id: authUser.user.id,
        tenant_id: tenant.id,
        email: tenant.contact_email,
        role: 'CLIENT'
      }]);

    if (profileErr) {
      // Need to cleanup auth user if profile creation fails in real app
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // 5. Update tenant
    const { error: updateErr } = await supabase
      .from('tenants')
      .update({
        status: 'APPROVED',
        api_key: apiKey
      })
      .eq('id', tenant.id);

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({ success: true, api_key: apiKey });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
