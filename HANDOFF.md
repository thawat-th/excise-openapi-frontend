# Frontend Handoff — Excise OpenAPI Platform

> สำหรับ AI/Developer ที่จะทำ UI ต่อ — อ่านไฟล์นี้ก่อนเริ่มงาน

---

## Project Overview

ระบบบริหารจัดการ API ของกรมสรรพสามิต (Thai Excise Department)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.3.5 + custom design tokens
- **UI Primitives:** Radix UI (@radix-ui/react-*)
- **Icons:** Lucide React
- **Data Tables:** AG Grid v35, TanStack Table v8
- **i18n:** Thai (default) + English — cookie-based (`gov_ui_language`)
- **Theme:** Light/Dark mode — class-based (`dark:` prefix)
- **Font:** Kanit (Thai), Inter (English) — auto-switch ตาม language

---

## 3 Portals

| Portal | Path | กลุ่มผู้ใช้ | Layout Component |
|--------|------|------------|-----------------|
| **Individual** | `/individual/*` | บุคคลธรรมดา (Developer) | `DeveloperPortalLayout` |
| **Organization** | `/organization/*` | นิติบุคคล (Company) | `DeveloperPortalLayout` |
| **Platform Admin** | `/platform-admin/*` | ผู้ดูแลระบบ (Admin) | `DashboardLayout` |

**Auth Routes:** `/auth/*` (login, register, callback, consent, 2fa, etc.)
**Legal Routes:** `/legal/*` (cookies, privacy, terms)

---

## สิ่งที่ทำแล้ว (Completed)

### Auth System (95%)
- Login/Logout flow (OAuth2 + Kratos)
- Registration — Individual + Organization (2-identity flow)
- Email verification, OTP verification
- OAuth2 consent screen
- WebAuthn/FIDO2 support
- CAPTCHA (Altcha)
- Forgot/Reset password pages
- 2FA (TOTP) setup page
- Accept invite page

### Individual Portal (90%)
- Dashboard — stat cards, charts, quick actions
- Profile page
- Services catalog
- API catalog with detail page
- Credentials management
- Requests page
- Notifications page
- Usage analytics
- Help page
- Security settings
- User Settings — Account, Password, MFA, Sessions, Preferences

### Organization Portal (85%)
- Dashboard — org-level stats
- Services, Credentials, Applications
- Team management (members)
- API catalog
- Requests, Usage
- Organization settings
- User Settings — Account, Password, MFA, Sessions, Preferences

### Platform Admin Portal (70%)
- Dashboard — system overview
- Approvals page (with detail view `/approvals/[id]`)
- Audit logs
- User management
- Role management
- Active sessions
- API analytics, Metrics
- Service registry with detail page
- Kong routes, Rate limits
- OAuth2 clients
- Permission policies + Policy test simulator
- Security rules
- Subscriptions, Categories, Providers, Versions
- Workflow history
- User Settings — Account, Password, MFA, Preferences
- Alerts, Integrations, Maintenance (scaffolded)

### Shared Components
- `Header` — main nav, portal switcher, notifications, theme toggle, language toggle
- `Footer` — legal links
- `Sidebar` — portal-specific navigation
- `DashboardLayout` / `DeveloperPortalLayout` — layout wrappers
- `DataTable`, `AdvancedDataTable` (AG Grid), `StatCard`, `ChartCard`, `PageHeader`
- `ApiCard`, `CategoryFilter` — catalog UI
- `PermissionGate`, `RoleGate` — authorization wrappers
- `Modal`, `ApproveModal`, `RejectModal`, `RequestInfoModal`
- `CookieConsentBanner`, `CookieSettingsModal` — PDPA compliance
- `FileUploadZone`, `FileUploadWithProgress`
- `ThaiAddressDropdown` — Province/District/Subdistrict cascading
- `OccupationDropdown`, `SearchableSelect`
- `OnboardingGuide`, `RegistrationTimeline`, `TermsDialog`
- `NotificationBell` — real-time via SSE
- `ContextSwitcher` — individual ↔ organization switching
- `Skeleton` — loading placeholders

### API Routes (BFF Pattern) — 73 routes
- `/api/auth/*` — OAuth2 flow, OTP, verification, challenges
- `/api/account/*` — profile, sessions, MFA, password, avatar
- `/api/notifications/*` — CRUD + SSE stream
- `/api/organizations/*` — members, applications, invitations
- `/api/registrations/*` — org registration review
- `/api/geo/*` — provinces/districts/subdistricts
- `/api/admin/*` — statistics

### Infrastructure
- Middleware — session validation, route protection, portal detection
- i18n — full EN/TH translations (~125KB EN, ~259KB TH)
- Session store — Redis-backed via ioredis
- Token refresh — automatic OAuth2 token rotation
- CSP nonce generation
- Request ID tracing

---

## สิ่งที่ต้องทำต่อ (TODO)

### UI/UX ที่ต้องปรับปรุง

1. **Platform Admin pages** — หลายหน้ายังเป็น wireframe/scaffold ต้อง polish UI
   - Dashboard: ต้องการ real charts (recharts/chart.js)
   - Approvals: review flow ยังไม่สมบูรณ์
   - API Docs page: ยังว่าง
   - Integrations, Maintenance pages: ยังเป็น placeholder

2. **Responsive design** — บางหน้ายังไม่ responsive บน mobile เต็มที่

3. **Form validation** — หลายฟอร์มยัง validate ฝั่ง client ไม่ครบ
   - validators อยู่ที่ `src/lib/validators/` (citizenId, email, password, username)

4. **Error states** — หลายหน้ายังไม่มี error boundary / empty state ที่ดี

5. **Loading states** — มี Skeleton component แล้ว แต่ยังใช้ไม่ครบทุกหน้า

### Features ที่ยังไม่ได้ทำ

1. **API Documentation viewer** — แสดง OpenAPI spec แบบ interactive (Scalar/Swagger)
2. **API Testing playground** — ให้ developer ทดลอง call API
3. **Usage dashboard charts** — กราฟแสดง API usage, latency, error rates
4. **Notification preferences** — ตั้งค่าว่าจะรับ notification อะไรบ้าง
5. **Organization billing** — ถ้ามี billing ในอนาคต
6. **Data export** — มี xlsx dependency แล้ว แต่ยังไม่ได้ implement ครบ

---

## Architecture Notes

### BFF Pattern
```
Browser → localhost:3000/api/* → Next.js API Route → Backend Services
                                                      ├── Kratos (4433/4434)
                                                      ├── Hydra (4444/4445)
                                                      ├── Keto (4466/4467)
                                                      ├── Governance (5001)
                                                      ├── Audit (5002)
                                                      └── Kong (8000) → Registry (5000)
```

- Client เรียก `/api/*` (same domain) เท่านั้น — ไม่เรียก backend ตรง
- httpOnly cookies ส่งอัตโนมัติ (fetch polyfill ใน layout)
- OAuth2 client secret อยู่ server-side เท่านั้น

### Auth Flow
```
/auth/login → Kratos login flow → session cookie
            → Hydra login challenge → consent → authorization code
            → /auth/callback → exchange code for tokens → redirect to portal
```

### Key Environment Variables
```env
# Client-side
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_BASE_URL=http://localhost:4433
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8000
NEXT_PUBLIC_OAUTH_CLIENT_ID=<uuid>
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback

# Server-side
IDENTITY_INTERNAL_URL=http://localhost:4433
IDENTITY_INTERNAL_ADMIN_URL=http://localhost:4434
AUTH_INTERNAL_URL=http://localhost:4444
AUTH_INTERNAL_ADMIN_URL=http://localhost:4445
PERMISSION_INTERNAL_READ_URL=http://localhost:4466
GOVERNANCE_API_URL=http://localhost:5001
AUDIT_SERVICE_URL=http://localhost:5002
OAUTH_CLIENT_SECRET=<secret>
COOKIE_SECRET=<32-char-secret>
REDIS_URL=redis://localhost:6379
```

---

## File Structure (Key Files)

```
src/
├── app/
│   ├── layout.tsx              ← Root layout (theme, language, fonts)
│   ├── page.tsx                ← Landing page
│   ├── middleware.ts           ← Auth protection, portal routing
│   ├── fonts.ts                ← Font configuration
│   ├── globals.css             ← Global styles + Tailwind
│   ├── auth/                   ← Auth pages (13 routes)
│   ├── legal/                  ← Legal pages (cookies, privacy, terms)
│   ├── individual/             ← Individual portal (13 pages)
│   ├── organization/           ← Organization portal (11 pages)
│   ├── platform-admin/         ← Admin portal (27 pages)
│   └── api/                    ← BFF API routes (73 routes)
├── components/
│   ├── ui/                     ← Primitives (checkbox, dropdown, sheet, skeleton)
│   ├── dashboard/              ← Layout, Sidebar, StatCard, DataTable, etc.
│   ├── developer-portal/       ← ApiCard, CategoryFilter, PortalLayout
│   ├── auth/                   ← RegistrationLayout, ProgressStepper
│   ├── legal/                  ← CookieConsent banner + modal
│   ├── modals/                 ← Approve, Reject, RequestInfo modals
│   ├── permissions/            ← PermissionGate, RoleGate
│   ├── settings/               ← UserSettingsLayout
│   ├── admin/                  ← ViewAsPortalSwitcher
│   ├── onboarding/             ← OnboardingGuide
│   ├── Header.tsx, Footer.tsx  ← Main navigation
│   └── ...                     ← Other shared components
├── lib/
│   ├── sdk/                    ← Kratos, Hydra, Session clients
│   ├── api-client/             ← Auto-generated from OpenAPI spec
│   ├── permissions/            ← Keto permission client
│   ├── validators/             ← Input validation (citizenId, email, etc.)
│   ├── routes.ts               ← Centralized route definitions
│   ├── api-client.ts           ← BFF fetch wrapper
│   ├── auth-helpers.ts         ← Auth utilities
│   ├── session-helpers.ts      ← Session validation
│   └── ...                     ← Other utilities
├── config/
│   └── navigation.ts           ← Portal navigation menus
├── contexts/
│   └── UserContextProvider.tsx  ← Individual ↔ Organization context
├── hooks/                      ← Custom hooks (usePermission, useRole, etc.)
├── i18n/                       ← en.json, th.json, i18n.ts
└── types/                      ← TypeScript types
```

---

## Design Tokens

### Colors (Tailwind)
- `primary-*` (50-900) — Blue corporate
- `accent-*` (50-900) — Orange/Gold
- `excise-*` (50-900) — Grayscale brand
- `brand-*` — Additional blue
- `gold-*` — Premium gold

### Component Classes (globals.css)
- `.btn-primary`, `.btn-secondary`, `.btn-danger`
- `.card`
- `.input-field`

### Animations
- `slide-up`, `fade-in`, `scale-in`, `fade-in-up`
- Delays: 200ms, 400ms, 600ms

---

## วิธี Run

```bash
npm install
npm run dev        # http://localhost:3000
```

ต้องมี backend services running (Kratos, Hydra, Keto, Kong, Go services) หรือตั้ง `BYPASS_AUTH=true` ใน .env.local เพื่อ bypass auth ตอน dev UI
