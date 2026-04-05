import { TrapType, ThreatLevel } from '@/types';

export function calculateThreatLevel(trapType: TrapType, userAgent: string | null): ThreatLevel {
  // A simple static scoring for the MVP.
  // In a real system, this would evaluate IPs against blacklists, 
  // analyze user_agent for known malicious actors, speed of execution, etc.
  
  if (trapType === 'API_KEY') {
    return 'CRITICAL'; // Copying an API key is intentional theft
  }
  
  if (trapType === 'TOXIC_PDF') {
    return 'MEDIUM'; // Downloading a hidden file
  }
  
  if (trapType === 'HIDDEN_URL') {
    const ua = userAgent?.toLowerCase() || '';
    if (ua.includes('curl') || ua.includes('python') || ua.includes('bot') || ua.includes('scraper')) {
      return 'MEDIUM'; // Automated scanner finding hidden URLs
    }
    return 'LOW'; // Curious user or generic crawler
  }

  return 'LOW';
}
