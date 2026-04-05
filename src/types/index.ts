export type TenantStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type UserRole = 'CLIENT' | 'SUPER_ADMIN';
export type TrapType = 'API_KEY' | 'HIDDEN_URL' | 'TOXIC_PDF';
export type ThreatLevel = 'LOW' | 'MEDIUM' | 'CRITICAL';

export interface Tenant {
  id: string;
  company_name: string;
  website_url: string;
  contact_email: string;
  status: TenantStatus;
  api_key: string | null;
  slack_webhook_url: string | null;
  created_at: string;
}

export interface User {
  id: string;
  auth_id: string;
  tenant_id: string | null;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Detonation {
  id: string;
  tenant_id: string;
  trap_type: TrapType;
  threat_level: ThreatLevel;
  attacker_ip: string;
  attacker_city: string | null;
  attacker_country: string | null;
  attacker_lat: number | null;
  attacker_lng: number | null;
  user_agent: string | null;
  created_at: string;
}
