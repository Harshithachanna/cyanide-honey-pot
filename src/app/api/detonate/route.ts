import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getGeoLocation } from '@/lib/geo';
import { calculateThreatLevel } from '@/lib/threat';
import { TrapType, ThreatLevel } from '@/types';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, trapType, userAgent } = body;

    if (!apiKey || !trapType) {
      return NextResponse.json({ error: 'Bad Request' }, { status: 400, headers: corsHeaders });
    }

    const supabase = createAdminClient();

    // 1. Verify API Key and get Tenant
    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('id, status, slack_webhook_url')
      .eq('api_key', apiKey)
      .single();

    if (tenantErr || !tenant || tenant.status !== 'APPROVED') {
      // Reject unauthorized requests without leaking info
      return new Response(null, { status: 204, headers: corsHeaders }); 
    }

    // 2. Extract Attacker Info
    // Handle Vercel / proxy headers mapping
    let attackerIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
    if (!attackerIp) {
      attackerIp = '127.0.0.1'; // Fallback
    } else {
      attackerIp = attackerIp.split(',')[0].trim();
    }

    // 3. Geolocation
    const geo = await getGeoLocation(attackerIp);

    // 4. Threat Scoring
    const threatLevel = calculateThreatLevel(trapType as TrapType, userAgent);

    // 5. Insert Record
    const payload = {
      tenant_id: tenant.id,
      trap_type: trapType,
      threat_level: threatLevel,
      attacker_ip: attackerIp,
      attacker_city: geo?.city || null,
      attacker_country: geo?.country || null,
      attacker_lat: geo?.lat || null,
      attacker_lng: geo?.lng || null,
      user_agent: userAgent?.substring(0, 500) || null // truncate just in case
    };

    const { error: insertErr } = await supabase
      .from('detonations')
      .insert([payload]);

    if (insertErr) {
      console.error('Detonation insert error:', insertErr);
    } else {
      // Async: 6. Fire Slack Webhook if configured
      if (tenant.slack_webhook_url) {
        fireSlackWebhook(tenant.slack_webhook_url, payload).catch(console.error);
      }
    }

    // Always 204 No Content to the attacker
    return new Response(null, { status: 204, headers: corsHeaders });

  } catch (error) {
    console.error('Detonation engine error:', error);
    // Fail silently to attacker
    return new Response(null, { status: 204, headers: corsHeaders });
  }
}

async function fireSlackWebhook(url: string, detonation: any) {
  const emoji = detonation.threat_level === 'CRITICAL' ? '🚨' : detonation.threat_level === 'MEDIUM' ? '⚠️' : '👀';
  
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${emoji} HONEYPOT_DETONATION_DETECTED`,
        emoji: true
      }
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Threat Level:*\n${detonation.threat_level}` },
        { type: "mrkdwn", text: `*Trap Type:*\n${detonation.trap_type}` }
      ]
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Attacker IP:*\n\`${detonation.attacker_ip}\`` },
        { type: "mrkdwn", text: `*Origin:*\n${detonation.attacker_city || 'Unknown'}, ${detonation.attacker_country || 'Unknown'}` }
      ]
    },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `*User Agent:* ${detonation.user_agent || 'N/A'}` }
      ]
    },
    { type: "divider" }
  ];

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks })
  });
}
