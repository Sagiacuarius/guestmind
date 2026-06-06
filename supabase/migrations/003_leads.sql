-- GuestMind MVP — Leads table
-- Contactos iniciales (pre-check-in): nombre, email, teléfono mínimo
-- Cuando hacen check-in, se marcan checked_in = true

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  checked_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, email)
);

CREATE INDEX idx_leads_property ON leads(property_id);
CREATE INDEX idx_leads_email ON leads(property_id, email);
CREATE INDEX idx_leads_unchecked ON leads(property_id, email) WHERE checked_in = false;

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_isolation_leads ON leads
  FOR ALL USING (property_id = current_setting('app.current_property_id')::UUID);
