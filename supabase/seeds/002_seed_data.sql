-- GuestMind MVP — Dataset ficticio: 10 huéspedes + estadías + preferencias
-- Ejecutar después de 001_initial_schema.sql

-- Propiedad piloto
INSERT INTO properties (id, name, services, whatsapp_enabled) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Hotel Piloto GuestMind', '{"spa": true, "restaurant": true, "sommelier": true}', true);

-- Memory Packs por segmento
INSERT INTO memory_packs (property_id, segment, baseline_recommendations, prompt_additions) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'honeymoon',
   '{"activities": ["cena romántica en la playa", "spa en pareja", "paseo en catamarán al atardecer", "degustación de vinos"], "tone": "celebratory and intimate", "dining": "cena privada, prioridad en restaurante gourmet"}',
   'The guest is on their honeymoon. Suggest romantic, private experiences. Emphasize celebration and intimacy.'),
  ('a0000000-0000-0000-0000-000000000001', 'family',
   '{"activities": ["piscina infantil", "club de niños", "cena familiar temprana", "excursión a las ruinas"], "tone": "warm and practical", "dining": "menú infantil disponible, horarios flexibles"}',
   'The guest is traveling with children. Prioritize family-friendly options, safety, and convenience. Avoid late-night activities.'),
  ('a0000000-0000-0000-0000-000000000001', 'business',
   '{"activities": ["desayuno temprano", "business center", "servicio de lavandería express", "traslado al aeropuerto"], "tone": "efficient and professional", "dining": "desayuno desde las 6am, room service 24h"}',
   'The guest is on a business trip. Prioritize efficiency, quiet spaces, and reliable connectivity. Minimize interruptions.'),
  ('a0000000-0000-0000-0000-000000000001', 'adventure',
   '{"activities": ["excursión guiada a la selva", "esnórquel en los arrecifes", "tirolesa", "tour cultural al poblado local"], "tone": "energetic and experiential", "dining": "picnic de aventura, cocina local auténtica"}',
   'The guest seeks adventure and authentic experiences. Suggest active, nature-based, and culturally immersive activities.');

-- 10 huéspedes con historial y preferencias
INSERT INTO guests (id, property_id, email, name, country, language, phone, whatsapp_consent) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'maria.silva@email.com', 'María Silva', 'BR', 'pt', '+5511999990001', true),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'john.smith@email.com', 'John Smith', 'US', 'en', '+12025550002', true),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'carlos.lopez@email.com', 'Carlos López', 'AR', 'es', '+5491133330003', false),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'anna.mueller@email.com', 'Anna Müller', 'DE', 'en', '+4915111110004', true),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'luisa.fernandez@email.com', 'Luisa Fernández', 'MX', 'es', '+5255123450005', true),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'james.wilson@email.com', 'James Wilson', 'UK', 'en', '+447700900006', false),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'yuki.tanaka@email.com', 'Yuki Tanaka', 'JP', 'en', '+819012340007', true),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'pedro.oliveira@email.com', 'Pedro Oliveira', 'BR', 'pt', '+5521987650008', true),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'sarah.johnson@email.com', 'Sarah Johnson', 'CA', 'en', '+14165550009', false),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'roberto.garcia@email.com', 'Roberto García', 'ES', 'es', '+3460011100010', true);

-- Preferencias
INSERT INTO preferences (guest_id, dietary_restrictions, interests, allergies) VALUES
  ('b0000000-0000-0000-0000-000000000001', '{vegetariana}', '{spa, yoga, gastronomía}', '{nueces}'),
  ('b0000000-0000-0000-0000-000000000002', '{}', '{buceo, golf, vinos}', '{}'),
  ('b0000000-0000-0000-0000-000000000003', '{sin gluten}', '{fútbol, música en vivo, masajes}', '{mariscos}'),
  ('b0000000-0000-0000-0000-000000000004', '{}', '{senderismo, fotografía, arte local}', '{}'),
  ('b0000000-0000-0000-0000-000000000005', '{vegana}', '{spa, meditación, gastronomía}', '{lácteos}'),
  ('b0000000-0000-0000-0000-000000000006', '{}', '{historia, arqueología, puros}', '{}'),
  ('b0000000-0000-0000-0000-000000000007', '{sin lactosa}', '{fotografía, jardinería, té}', '{gluten}'),
  ('b0000000-0000-0000-0000-000000000008', '{}', '{surf, gastronomía, música}', '{cítricos}'),
  ('b0000000-0000-0000-0000-000000000009', '{vegetariana}', '{yoga, lectura, gastronomía}', '{}'),
  ('b0000000-0000-0000-0000-000000000010', '{}', '{tenis, vinos, historia}', '{frutos secos}');

-- Estadías previas (historial)
INSERT INTO stays (guest_id, property_id, check_in_date, check_out_date, room_number, group_composition, travel_reason) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2025-08-15', '2025-08-22', '302', 'couple', 'honeymoon'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', '2025-11-10', '2025-11-17', '105', 'solo', 'business'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '2025-12-20', '2026-01-02', '410', 'family', 'family'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', '2026-01-05', '2026-01-12', '201', 'solo', 'adventure'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', '2026-02-14', '2026-02-18', '305', 'couple', 'honeymoon'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', '2026-03-01', '2026-03-08', '108', 'solo', 'business'),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', '2026-03-15', '2026-03-22', '220', 'couple', 'adventure'),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', '2026-04-01', '2026-04-05', '315', 'group', 'leisure'),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', '2026-04-10', '2026-04-17', '102', 'solo', 'adventure'),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', '2026-05-01', '2026-05-08', '401', 'couple', 'leisure');
