# GuestMind MVP — Plan de Implementación

> **Para Hermes:** Usar `subagent-driven-development` para implementar este plan milestone por milestone.
> **Para Developers:** Cada tarea es bite-sized (2-5 min). TDD en todas las tasks de frontend. Commits frecuentes.

**Goal:** MVP funcional en 4 semanas: formulario check-in tablet-first → perfil enriquecido → email/WhatsApp pre-check-in → panel concierge → dashboard.

**Arquitectura:** React SPA (Vite + TypeScript + Tailwind) + Supabase (datos + RLS) + n8n (orquestador) + OpenRouter (LLM).

**Repositorio:** `github.com/Sagiacuarius/guestmind` (crear en Milestone 0)

---

## Milestone 0: Setup del Proyecto (Día 1)

### Task 0.1: Crear repo y scaffold del proyecto

**Objective:** Inicializar el monorepo con Vite + React + TypeScript + Tailwind

**Files:**
- Crear: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `index.html`
- Crear: `src/main.tsx`, `src/App.tsx`
- Crear: `.github/workflows/ci.yml`
- Crear: `.env.example`

**Steps:**
```bash
npm create vite@latest guestmind -- --template react-ts
cd guestmind
npm install react-router-dom zustand @supabase/supabase-js
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init
```

**Verificación:** `npm run dev` → SPA carga en `localhost:5173`

---

### Task 0.2: Configurar Tailwind y estructura de directorios

**Objective:** Crear la estructura de carpetas Clean Architecture para el frontend

**Files:**
- Crear: `src/domain/` (tipos puros, sin dependencias)
- Crear: `src/data/` (capa de acceso a Supabase)
- Crear: `src/ui/` (componentes React, páginas, layouts)
- Crear: `src/i18n/` (traducciones ES/EN/PT)
- Crear: `src/config/` (constantes, feature flags)

**Estructura:**
```
src/
├── domain/
│   ├── guest.ts        # Tipos: Guest, Stay, Preference, MemoryPack
│   ├── property.ts     # Tipos: Property, Service
│   └── check-in.ts     # Validaciones puras: validateCheckInForm()
├── data/
│   ├── supabase.ts     # Cliente supabase-js inicializado
│   ├── guests.ts       # CRUD huéspedes
│   ├── stays.ts        # CRUD estadías
│   └── properties.ts   # CRUD propiedades
├── ui/
│   ├── pages/
│   │   ├── CheckInPage.tsx
│   │   ├── ConciergePage.tsx
│   │   └── DashboardPage.tsx
│   ├── components/
│   │   ├── CheckInForm.tsx
│   │   ├── GuestLookup.tsx
│   │   ├── GuestCard.tsx
│   │   └── Layout.tsx
│   └── hooks/
│       ├── useGuests.ts
│       └── useStays.ts
├── config/
│   └── constants.ts
├── App.tsx
└── main.tsx
```

---

## Milestone 1: Supabase + n8n Setup (Semana 1 — Días 2-5)

### Task 1.1: Crear proyecto Supabase y schema SQL

**Objective:** Ejecutar el DDL completo (tablas, índices, RLS)

**Files:**
- Crear: `supabase/migrations/001_initial_schema.sql`
- Ejecutar en Supabase SQL Editor

**Steps:**
1. Crear proyecto Supabase (free tier, región según hotel piloto)
2. Copiar DDL de `architecture.md` §5 al SQL Editor
3. Verificar: `SELECT * FROM properties` retorna 0 rows (sin error)

**Verificación:** Todas las tablas creadas, RLS habilitado, índices existentes.

---

### Task 1.2: Configurar RLS policies

**Objective:** Asegurar que cada propiedad solo ve sus datos

**SQL a ejecutar:**
```sql
-- Función helper para setear el contexto de propiedad
CREATE OR REPLACE FUNCTION set_property_context(property_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_property_id', property_id::TEXT, false);
END;
$$ LANGUAGE plpgsql;

-- Policy para guests
CREATE POLICY property_isolation_guests ON guests
  FOR ALL USING (property_id = current_setting('app.current_property_id')::UUID);

-- Policy para stays
CREATE POLICY property_isolation_stays ON stays
  FOR ALL USING (property_id = current_setting('app.current_property_id')::UUID);
```

**Verificación:** Insertar guest en propiedad A, consultar con contexto de propiedad B → 0 resultados.

---

### Task 1.3: Configurar Supabase Database Webhook → n8n

**Objective:** Cuando se inserta un nuevo stay, Supabase notifica a n8n

**Steps:**
1. En Supabase Dashboard → Database → Webhooks → Create
2. Event: `INSERT` on `stays`
3. URL: `https://n8n-dev.niawi.tech/webhook/check-in-detected`
4. Crear workflow n8n `wf-check-in-detected` con Webhook node

**n8n workflow inicial (mínimo):**
```
Webhook (receive) → Respond to Webhook (200 OK)
```

**Verificación:** Insertar stay en Supabase → n8n execution aparece en `n8n_list_executions`.

---

### Task 1.4: Configurar OpenRouter API key en n8n

**Objective:** n8n puede llamar a OpenRouter para generar contenido

**Steps:**
1. Crear Header Auth credential en n8n con `Authorization: Bearer <OPENROUTER_API_KEY>`
2. Probar con HTTP Request node → `POST https://openrouter.ai/api/v1/chat/completions`
3. Verificar respuesta 200 con contenido generado

---

## Milestone 2: Check-in Platform (Semana 2 — Días 6-10)

### Task 2.1: Definir tipos de dominio (domain/)

**Objective:** Escribir tipos TypeScript puros para Guest, Stay, Property, MemoryPack

**Files:**
- Crear: `src/domain/guest.ts`
- Crear: `src/domain/property.ts`
- Crear: `src/domain/check-in.ts`

**Steps (TDD):**
1. Escribir `guest.test.ts` → test que verifica que el tipo `Guest` tiene los campos requeridos
2. Escribir `src/domain/guest.ts`:
```typescript
export interface Guest {
  id: string
  propertyId: string
  email: string
  document?: string
  name: string
  country?: string
  language: 'es' | 'en' | 'pt'
  phone?: string
  whatsappConsent: boolean
  createdAt: string
}

export interface Stay {
  id: string
  guestId: string
  propertyId: string
  checkInDate: string
  checkOutDate?: string
  roomNumber?: string
  groupComposition?: string
  travelReason?: string
  enrichedProfile?: Record<string, unknown>
  emailContent?: string
  emailSentAt?: string
  itineraryContent?: string
  createdAt: string
}

export interface Preference {
  dietaryRestrictions: string[]
  interests: string[]
  allergies: string[]
}

export interface MemoryPack {
  id: string
  propertyId: string
  segment: 'honeymoon' | 'family' | 'business' | 'adventure'
  baselineRecommendations: Record<string, unknown>
  promptAdditions?: string
}
```

**Verificación:** `npm run typecheck` pasa sin errores.

---

### Task 2.2: Implementar validaciones de check-in (domain/)

**Objective:** Funciones puras de validación del formulario de check-in

**Files:**
- Crear: `src/domain/check-in.ts`

**Steps (TDD):**
1. Escribir `check-in.test.ts`:
   - `validateCheckInForm({ name: '', email: 'test@test.com' })` → `{ valid: false, errors: { name: 'required' } }`
   - `validateCheckInForm({ name: 'Leo', email: 'invalid' })` → `{ valid: false, errors: { email: 'invalid' } }`
   - `validateCheckInForm({ name: 'Leo', email: 'leo@test.com' })` → `{ valid: true, errors: {} }`
2. Implementar `validateCheckInForm()` en `src/domain/check-in.ts`

**Verificación:** 3 tests pasan.

---

### Task 2.3: Configurar cliente Supabase (data/)

**Objective:** Inicializar supabase-js con las credenciales del proyecto

**Files:**
- Crear: `src/data/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Verificación:** `supabase` se instancia sin errores en `npm run dev`.

---

### Task 2.4: Implementar lookup de huésped (data/ + ui/)

**Objective:** Buscar huésped por email al iniciar check-in

**Files:**
- Crear: `src/data/guests.ts` — `lookupGuestByEmail(email: string): Promise<Guest | null>`
- Crear: `src/ui/components/GuestLookup.tsx`

**Steps (TDD):**
1. Test: mockear supabase-js → `lookupGuestByEmail('test@test.com')` retorna Guest
2. Implementar `src/data/guests.ts`:
```typescript
export async function lookupGuestByEmail(email: string): Promise<Guest | null> {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('email', email)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}
```
3. Componente `GuestLookup.tsx`: input email + botón "Buscar" + resultado (precarga o "Huésped nuevo")

**Verificación:** Test pasa. UI muestra resultado en < 1 segundo.

---

### Task 2.5: Implementar formulario de check-in (ui/)

**Objective:** Formulario tablet-first con validación y persistencia

**Files:**
- Crear: `src/ui/pages/CheckInPage.tsx`
- Crear: `src/ui/components/CheckInForm.tsx`
- Crear: `src/data/stays.ts` — `createStay(stay: Partial<Stay>): Promise<Stay>`

**Steps:**
1. `CheckInForm.tsx`: campos (nombre, email, país, idioma, motivo de viaje, composición del grupo, fechas, habitación)
2. Validación en tiempo real usando `validateCheckInForm()`
3. Botones touch-friendly (mín 44x44px)
4. Al submit → `createStay()` → Supabase → webhook a n8n

**Verificación:** 
- Formulario se ve bien en viewport 768x1024 (tablet vertical)
- Submit exitoso → registro en Supabase → n8n recibe webhook
- Campo vacío → error en rojo, no se envía

---

### Task 2.6: Implementar persistencia de estadías (data/)

**Objective:** CRUD completo para stays con tipado fuerte

**Files:**
- Crear: `src/data/stays.ts`

```typescript
export async function createStay(stay: Omit<Stay, 'id' | 'createdAt'>): Promise<Stay> {
  const { data, error } = await supabase
    .from('stays')
    .insert(stay)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTodayStays(propertyId: string): Promise<Stay[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('stays')
    .select('*, guests(*)')
    .eq('property_id', propertyId)
    .eq('check_in_date', today)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}
```

**Verificación:** Tests con mock → create + query retornan datos correctos.

---

### Task 2.7: Cargar Memory Packs iniciales

**Objective:** Insertar 4 Memory Packs baseline en Supabase

**Files:**
- Crear: `supabase/seeds/memory_packs.sql`

**Contenido:**
```sql
INSERT INTO memory_packs (property_id, segment, baseline_recommendations, prompt_additions) VALUES
('<property-uuid>', 'honeymoon', '{"activities": ["cena romántica", "spa en pareja", "paseo al atardecer"], "tone": "celebratory and intimate"}', 'The guest is on their honeymoon. Suggest romantic experiences.'),
('<property-uuid>', 'family', '{"activities": ["piscina infantil", "club de niños", "cena familiar temprana"], "tone": "warm and practical"}', 'The guest is traveling with children. Prioritize family-friendly options.'),
('<property-uuid>', 'business', '{"activities": ["early breakfast", "business center", "express laundry"], "tone": "efficient and professional"}', 'The guest is on a business trip. Prioritize convenience and quiet.'),
('<property-uuid>', 'adventure', '{"activities": ["excursión guiada", "deportes acuáticos", "tour cultural"], "tone": "energetic and experiential"}', 'The guest seeks adventure. Suggest active and nature-based experiences.');
```

---

### Task 2.8: Ruta de check-in y layout base

**Objective:** Navegación funcional entre páginas con layout responsive

**Files:**
- Crear: `src/ui/components/Layout.tsx`
- Modificar: `src/App.tsx` → agregar React Router

**Steps:**
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './ui/components/Layout'
import { CheckInPage } from './ui/pages/CheckInPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/check-in" element={<CheckInPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
```

**Verificación:** `localhost:5173/check-in` → formulario visible, responsive en 768px.

---

## Milestone 3: Primer Resultado (Semana 3 — Días 11-15)

### Task 3.1: Completar workflow n8n — check-in detectado

**Objective:** n8n recibe webhook → enriquece perfil → dispara generación LLM en paralelo

**n8n workflow:** `wf-check-in-detected`
```
1. Webhook (receive) — espera POST de Supabase
2. Supabase node — GET guest full profile + preferences + memory_pack
3. Code node — enriquece perfil (merge history + current + memory pack)
4. PATCH Supabase — guarda enriched_profile en stay
5. Split In Batches (parallel):
   a. HTTP Request → OpenRouter (generar email pre-check-in)
   b. HTTP Request → OpenRouter (generar itinerario)
6. Merge → PATCH Supabase (guarda email_content, itinerary_content)
7. Switch (property services):
   - Si spa → HTTP Request → notificar staff spa
   - Si restaurant → notificar staff restaurant
   - Si sommelier → notificar staff sommelier
```

**Code node (enriquecer perfil):**
```javascript
const guest = $input.first().json.guest;
const stay = $input.first().json.stay;
const memoryPack = $input.first().json.memory_pack;
const previousStays = $input.first().json.previous_stays || [];

const enrichedProfile = {
  guest_name: guest.name,
  language: guest.language || 'es',
  country: guest.country,
  dietary_restrictions: guest.preferences?.dietary_restrictions || [],
  interests: guest.preferences?.interests || [],
  allergies: guest.preferences?.allergies || [],
  current_stay: {
    check_in_date: stay.check_in_date,
    room: stay.room_number,
    group: stay.group_composition,
    reason: stay.travel_reason
  },
  previous_visits: previousStays.length,
  segment: memoryPack.segment,
  baseline_recommendations: memoryPack.baseline_recommendations
};

return { enrichedProfile, memoryPack };
```

---

### Task 3.2: Workflow n8n — envío de email pre-check-in

**Objective:** n8n envía email vía SendGrid con el contenido generado por LLM

**n8n workflow:** `wf-send-pre-check-in-email`
```
1. Cron trigger — cada día a las 08:00
2. Supabase node — query: stays WHERE check_in_date = today + 3 days AND email_sent_at IS NULL
3. Loop over items:
   a. HTTP Request → OpenRouter (generar email pre-check-in si no generado)
   b. SendGrid node → enviar email a guest.email
   c. PATCH Supabase → email_sent_at = now()
```

---

### Task 3.3: Implementar fallback multi-proveedor LLM

**Objective:** Si OpenRouter/GPT-4o-mini falla → automáticamente usar Claude Haiku

**En n8n workflow:**
```
HTTP Request (OpenRouter GPT-4o-mini)
  → On Error:
    → HTTP Request (OpenRouter Claude Haiku)
      → On Error:
        → Code node: registrar error, encolar reintento
```

---

### Task 3.4: Implementar exportación de datos (data/ + ui/)

**Objective:** Gerente descarga CSV/JSON con todos los datos de su propiedad

**Files:**
- Crear: `src/data/export.ts`
- Crear: `src/ui/pages/DashboardPage.tsx` (sección export)

```typescript
export async function exportPropertyData(propertyId: string): Promise<Blob> {
  const { data: guests } = await supabase.from('guests').select('*').eq('property_id', propertyId)
  const { data: stays } = await supabase.from('stays').select('*').eq('property_id', propertyId)

  const csv = [
    'id,name,email,country,language,check_in_date,room,travel_reason,preferences',
    ...stays.map(s => `${s.id},${s.guest_name},${s.guest_email},...`)
  ].join('\n')

  return new Blob([csv], { type: 'text/csv' })
}
```

---

## Milestone 4: Activación Completa (Semana 4 — Días 16-20)

### Task 4.1: Panel del concierge (ui/)

**Objective:** Vista de huéspedes del día con perfil e itinerario

**Files:**
- Crear: `src/ui/pages/ConciergePage.tsx`
- Crear: `src/ui/components/GuestCard.tsx`
- Crear: `src/ui/hooks/useTodayStays.ts`

**Steps:**
1. `useTodayStays` hook → `getTodayStays(propertyId)`
2. `ConciergePage` → lista de GuestCards
3. `GuestCard` → expandible: perfil completo + itinerario

**Verificación:** 
- Panel carga en < 2 segundos con 50 huéspedes
- Sin huéspedes hoy → mensaje "Sin huéspedes hoy"
- Click en huésped → expande detalle

---

### Task 4.2: Dashboard de métricas (ui/)

**Objective:** Dashboard con KPIs: tasa apertura, upsell, NPS, costo tokens

**Files:**
- Crear: `src/ui/pages/DashboardPage.tsx`
- Crear: `src/ui/components/MetricCard.tsx`

**Steps:**
1. Queries agregadas en Supabase:
```sql
SELECT COUNT(*) FILTER (WHERE email_sent_at IS NOT NULL) as emails_sent,
       COUNT(*) FILTER (WHERE email_opened_at IS NOT NULL) as emails_opened
FROM stays
WHERE property_id = '<id>' AND check_in_date BETWEEN '<start>' AND '<end>'
```
2. Componentes visuales (MetricCard con número grande + label)
3. Selector de rango de fechas
4. Botón exportar → reusa `exportPropertyData()`

---

### Task 4.3: Integración WhatsApp (n8n workflow)

**Objective:** Enviar itinerario por WhatsApp al huésped que dio consent

**n8n workflow:** Agregar al `wf-check-in-detected`:
```
If guest.whatsapp_consent == true AND property.whatsapp_enabled:
  → HTTP Request Evolution API → POST /message/sendText
```

---

### Task 4.4: Alertas internas al staff (n8n workflow)

**Objective:** Notificar a spa/restaurant/sommelier cuando un huésped tiene preferencias relevantes

**En n8n Code node (post-enriquecimiento):**
```javascript
const alerts = [];
const prefs = enrichedProfile.interests || [];

if (prefs.includes('masajes') || prefs.includes('spa')) {
  alerts.push({ service: 'spa', guest_name: guest.name, room: stay.room_number });
}
if (prefs.includes('gastronomía') || prefs.includes('restaurant')) {
  alerts.push({ service: 'restaurant', guest_name: guest.name });
}
// ... sommelier

return alerts;
```

**Verificación:** Insertar guest con interés "masajes" → n8n execution muestra alerta a spa.

---

### Task 4.5: Traducciones i18n (ES/EN/PT)

**Objective:** Todos los textos de la UI en 3 idiomas

**Files:**
- Crear: `src/i18n/translations.ts`

```typescript
export const translations = {
  es: { checkIn: { title: 'Check-in', searchPlaceholder: 'Buscar huésped...', newGuest: 'Huésped nuevo' } },
  en: { checkIn: { title: 'Check-in', searchPlaceholder: 'Search guest...', newGuest: 'New guest' } },
  pt: { checkIn: { title: 'Check-in', searchPlaceholder: 'Buscar hóspede...', newGuest: 'Novo hóspede' } }
} as const
```

---

### Task 4.6: Deploy a Vercel y pruebas E2E

**Objective:** Frontend en producción, flujo completo verificado

**Steps:**
1. `git push origin main` → GitHub Actions → Vercel deploy
2. Prueba E2E manual:
   a. Abrir `guestmind.vercel.app/check-in` en tablet
   b. Registrar huésped nuevo → verificar INSERT en Supabase
   c. Verificar n8n execution disparada
   d. Verificar email recibido (SendGrid)
   e. Abrir panel concierge → ver huésped del día
   f. Abrir dashboard → ver métricas iniciales

---

## Resumen de User Stories Cubiertas

| US | Nombre | Milestone | Prioridad |
|---|---|---|---|
| US-007 | Configuración Supabase | M1 | Must have |
| US-001 | Formulario check-in | M2 | Must have |
| US-002 | Lookup huésped previo | M2 | Must have |
| US-003 | Perfil enriquecido | M3 | Must have |
| US-006 | Memory Packs | M2 | Should have |
| US-014 | Exportación datos | M3 | Must have |
| US-004 | Email pre-check-in | M3 | Must have |
| US-009 | LLM fallback | M3 | Must have |
| US-008 | n8n orquestación | M3 | Must have |
| US-010 | Itinerario personalizado | M3 | Should have |
| US-005 | Panel concierge | M4 | Must have |
| US-011 | WhatsApp Business | M4 | Should have |
| US-012 | Alertas staff | M4 | Could have |
| US-013 | Dashboard métricas | M4 | Should have |

---

## Preguntas Bloqueantes (antes de empezar Milestone 1)

1. **¿Hotel piloto definido?** → Determina región Supabase, idioma principal, conectividad
2. **¿Presupuesto de desarrollo?** → Define cuántas horas/semana se dedican
3. **¿Datos históricos del hotel?** → Determina si hay migración inicial o se arranca de cero

---

*Plan generado según skills `writing-plans` v1.1 + `solution-architect` v1.0.*
