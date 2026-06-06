-- GuestMind MVP — Schema inicial
-- Supabase PostgreSQL con Row-Level Security multi-tenant
-- Región: West US Oregon (us-west-2)

-- 1. Propiedades (multi-tenant root)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  services JSONB DEFAULT '{"spa": false, "restaurant": false, "sommelier": false}',
  whatsapp_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Huéspedes
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  email TEXT NOT NULL,
  document TEXT,
  name TEXT NOT NULL,
  country TEXT,
  language TEXT DEFAULT 'es',
  phone TEXT,
  whatsapp_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, email)
);

-- 3. Preferencias (históricas, acumulativas por huésped)
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  dietary_restrictions TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Estadías (cada visita genera un registro nuevo)
CREATE TABLE stays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  check_in_date DATE NOT NULL,
  check_out_date DATE,
  room_number TEXT,
  group_composition TEXT,
  travel_reason TEXT,
  enriched_profile JSONB,
  email_content TEXT,
  email_sent_at TIMESTAMPTZ,
  itinerary_content TEXT,
  itinerary_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Memory Packs (baseline por segmento, por propiedad)
CREATE TABLE memory_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  segment TEXT NOT NULL CHECK (segment IN ('honeymoon', 'family', 'business', 'adventure')),
  baseline_recommendations JSONB NOT NULL,
  prompt_additions TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, segment)
);

-- 6. Alertas enviadas al staff
CREATE TABLE staff_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  stay_id UUID NOT NULL REFERENCES stays(id),
  service_type TEXT NOT NULL CHECK (service_type IN ('spa', 'restaurant', 'sommelier')),
  preference_matched TEXT,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_guests_property ON guests(property_id);
CREATE INDEX idx_guests_email ON guests(property_id, email);
CREATE INDEX idx_stays_date ON stays(property_id, check_in_date);
CREATE INDEX idx_stays_guest ON stays(guest_id);
CREATE INDEX idx_preferences_guest ON preferences(guest_id);

-- Row-Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_alerts ENABLE ROW LEVEL SECURITY;

-- Función helper: setea el contexto de propiedad para RLS
CREATE OR REPLACE FUNCTION set_property_context(property_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_property_id', property_id::TEXT, false);
END;
$$ LANGUAGE plpgsql;

-- Policies: cada propiedad solo ve sus datos
CREATE POLICY property_isolation_guests ON guests
  FOR ALL USING (property_id = current_setting('app.current_property_id')::UUID);

CREATE POLICY property_isolation_stays ON stays
  FOR ALL USING (property_id = current_setting('app.current_property_id')::UUID);

CREATE POLICY property_isolation_preferences ON preferences
  FOR ALL USING (
    guest_id IN (
      SELECT id FROM guests WHERE property_id = current_setting('app.current_property_id')::UUID
    )
  );

CREATE POLICY property_isolation_memory_packs ON memory_packs
  FOR ALL USING (property_id = current_setting('app.current_property_id')::UUID);

CREATE POLICY property_isolation_staff_alerts ON staff_alerts
  FOR ALL USING (property_id = current_setting('app.current_property_id')::UUID);

CREATE POLICY property_isolation_properties ON properties
  FOR ALL USING (id = current_setting('app.current_property_id')::UUID);
