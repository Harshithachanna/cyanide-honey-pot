import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  
  // RLS ensures they only see their own data
  const { data: detonations, error } = await supabase
    .from('detonations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate stats
  const total = detonations.length;
  const critical = detonations.filter(d => d.threat_level === 'CRITICAL').length;
  
  // Most targeted trap logic
  const trapCounts = detonations.reduce((acc, curr) => {
    acc[curr.trap_type] = (acc[curr.trap_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let mostTargeted = 'None';
  let maxCount = 0;
  for (const [trap, count] of Object.entries(trapCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostTargeted = trap;
    }
  }

  return NextResponse.json({
    total,
    critical,
    mostTargeted: mostTargeted.replace('_', ' '),
    recent: detonations.slice(0, 10), // Top 10 for overview
    allLocations: detonations.filter(d => d.attacker_lat && d.attacker_lng).map(d => ({
      id: d.id,
      lat: d.attacker_lat,
      lng: d.attacker_lng,
      level: d.threat_level
    }))
  });
}
