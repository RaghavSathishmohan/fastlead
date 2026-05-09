-- LeadFast Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT,
  company_name TEXT NOT NULL,
  alert_email BOOLEAN DEFAULT true,
  alert_sms BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  phone TEXT,
  email TEXT,
  service TEXT,
  city TEXT,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'called', 'won', 'lost')),
  raw_input TEXT,
  owner_notified BOOLEAN DEFAULT false,
  customer_replied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "clients_select_token"
  ON clients FOR SELECT
  USING (true);

CREATE POLICY "clients_insert_service"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "clients_update_service"
  ON clients FOR UPDATE
  USING (true);

-- RLS Policies for leads
CREATE POLICY "leads_select_token"
  ON leads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = leads.client_id
  ));

CREATE POLICY "leads_insert_service"
  ON leads FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = leads.client_id
  ));

CREATE POLICY "leads_update_token"
  ON leads FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = leads.client_id
  ));

-- Realtime publication for leads
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_token ON clients(token);

-- Function for 90-day cleanup
CREATE OR REPLACE FUNCTION cleanup_old_leads()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM leads
  WHERE created_at < NOW() - INTERVAL '90 days'
    AND status IN ('lost', 'called');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
