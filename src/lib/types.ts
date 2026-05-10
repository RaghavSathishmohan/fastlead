export interface Client {
  id: string;
  token: string;
  name: string;
  owner_email: string;
  owner_phone: string | null;
  company_name: string;
  alert_email: boolean;
  alert_sms: boolean;
  status: 'pending' | 'active' | 'paused';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  client_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  service: string;
  city: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'new' | 'called' | 'won' | 'lost';
  raw_input: string | null;
  owner_notified: boolean;
  customer_replied: boolean;
  created_at: string;
}

export type LeadStatus = Lead['status'];
export type LeadUrgency = Lead['urgency'];
