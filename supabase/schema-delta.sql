-- LeadFast Schema Delta (run this instead of the full schema)
-- Only applies changes that don't exist yet

-- Add notes column
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;

-- Add duplicate tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS duplicate_of UUID REFERENCES leads(id) ON DELETE SET NULL;

-- Expand status constraint to include 'duplicate'
-- Note: requires dropping and recreating the constraint
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('new', 'called', 'won', 'lost', 'duplicate'));

-- Indexes for duplicate detection performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(client_id, email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(client_id, phone, created_at DESC);
