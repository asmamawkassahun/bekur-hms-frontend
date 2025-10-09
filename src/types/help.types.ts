// Help Center Types

export interface ServiceStatus {
  name: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' | 'UNKNOWN';
  responseTimeMs?: number;
  lastCheckedAt?: string;
}

export interface SystemStatus {
  overall: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' | 'UNKNOWN';
  uptimePercentage?: number;
  services?: ServiceStatus[];
  checkedAt?: string;
}

export interface SupportTicketPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SupportTicketResponse {
  id: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt?: string;
}


