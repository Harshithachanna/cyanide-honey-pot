import { createClient } from './supabase/server';
import { User } from '@/types';

import { createAdminClient } from './supabase/admin';

export async function getUserAndRole(): Promise<{ user: any, profile: User | null }> {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { user: null, profile: null };
    }

    const adminSupabase = createAdminClient();
    const { data: profile, error: profileError } = await adminSupabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError, "Profile:", profile, "User ID:", user.id);
      return { user, profile: null };
    }

    return { user, profile: profile as User };
  } catch (e) {
    console.error("getUserAndRole exception:", e);
    return { user: null, profile: null };
  }
}
