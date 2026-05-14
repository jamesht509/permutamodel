# AGENT_MEMORY — PermutaModel Sessão 2

> **Para o próximo agente:** este documento é teu briefing completo. Lê INTEIRO antes de tocar em código. Foi escrito ao final de uma sessão muito longa (Fase 1→6 do `PROMPT_SESSAO_2_CLAUDE_CODE_v2.md`), captura tudo que foi decidido, feito, deferido e pendente. Se algo aqui contradiz o que você acha que sabe sobre o projeto, este documento ganha.

---

## 0. TL;DR

- Repo: `jamesht509/permutamodel` (versão BR do produto). `shutter-muse` é a versão US legacy (CollabShoot), intocada.
- Branch ativa: **`feat/br-launch-foundation`** — última HEAD: `6834ec1` (final da Fase 6, em sync com `origin/`).
- Owner: **Jemson Marius** (chama Jemson, não Sr.). Tom de conversa amigo-profissional, sem formal.
- Idioma de código/commits: **inglês**. UI/strings PT-BR coloquial-profissional ("Nubank/iFood"). Dicionário autoritativo: `PROMPT_SESSAO_2_CLAUDE_CODE_v2.md` Seção 5.
- Plano-mestre: `PROMPT_SESSAO_2_CLAUDE_CODE_v2.md` na raiz. **Fases 1–6 completas.** **Fases 7 e 8 pendentes.**
- Supabase project ref: `ogilgnvspwjvbvjdrxvw` (sa-east-1, São Paulo).
- Brevo + Supabase Auth Hook **integração validada end-to-end** — chave setada, sender verificado, magic link em PT-BR chegou no inbox.

---

## 1. Identidade do projeto

### Stack
- Vite + React 18 + TypeScript + shadcn/ui
- Tailwind CSS (Paleta B dark-first)
- Supabase (Postgres + Auth + Edge Functions + Storage)
- Email: **Brevo** (substituiu Resend na Fase 5)
- React Router v6
- framer-motion, sonner (toasts), zod, date-fns

### Brand split (autoritativo — não confunda)
- **PermutaModel** (BR): launch foco, domínio `permutamodel.com.br`, sender `noreply@permutamodel.com.br`, lang `pt-BR`, country `BR`. Paleta B coral (#FF6B4A) + dark.
- **CollabShoot** (US legacy): domínio `collabshoot.com`, sender `noreply@collabshoot.com`, lang `en`, country `US`. Paleta gold (#a67c3d) + cream.
- **Detecção:** `src/lib/brand.ts` por hostname (browser) e `supabase/functions/_shared/brand.ts` por `user_metadata.lang/country` ou `profile.country` (servidor). **Default sempre BR** (per spec 5.4) — só vai pro US se metadata explicitamente disser EN/US.

---

## 2. Estado do repo

### Working directory
`/home/user/permutamodel` (sandbox Linux Ubuntu 24.04).

### Git
```
Branch:   feat/br-launch-foundation
Tracking: origin/feat/br-launch-foundation (ahead 0, behind 0)
Base:     main (limpo, com auditoria commitada)
```

### Commits da Sessão 2 (ordem cronológica)

| Fase | SHA       | Título resumido                                                              |
|------|-----------|------------------------------------------------------------------------------|
| 1    | `14787ba` | chore: remove Lovable, restore native Supabase auth                          |
| 1    | `d181d5c` | fix(auth): handle PKCE code exchange in AuthCallback                         |
| 2    | `1977e93` | feat: apply paleta B tokens, refactor 5 core ui components                   |
| 3    | `b8b5472` | feat(i18n): strings.ts foundation + voice refresh + cleanup                  |
| 3    | `3b05260` | feat(i18n): migrate 5 EN-only components to t.*                              |
| 3    | `578d04a` | fix(i18n): voice consistency ajustes — uniform 'tu' register                 |
| 3    | `be4b7cb` | feat(i18n): migrate 7 EN-only pages to t.*                                   |
| 3    | `aa372f6` | feat(i18n): migrate Dashboard + Discover (FINAL)                             |
| 4    | `db9e740` | feat(db): notifications.kind/params + sessions.location nullable             |
| 4    | `cdcb0e1` | feat(notifications): kind+params on all 9 inserts + sessions.location fix    |
| 4    | `abcdd22` | feat(notifications): render via t.notifs[kind](params) (FINAL)               |
| 5    | `a152436` | feat(email): Brevo client + brand routing shared modules                     |
| 5    | `b97e71a` | feat(email): 12 template builders (6 kinds × 2 langs)                        |
| 5    | `025b448` | feat(email): rewrite auth-email-hook + send-welcome on Brevo                 |
| 5    | `f2eaaa3` | feat(email): send-reengagement on Brevo + LOCK send-email (FINAL)            |
| 6    | `d60a3d1` | feat(distance): switch from miles to kilometers                              |
| 6    | `027306d` | feat(onboarding): BR city autocomplete + 17 BR styles + optional Instagram   |
| 6    | `1463a36` | feat(pro): hide PRO surface area for BR launch                               |
| 6    | `6834ec1` | feat(castings): country-scoped feed (FINAL Fase 6)                           |

Total: **19 commits** (incluindo 1 fix de PKCE e 1 fix de voice).

---

## 3. Estado do banco (Supabase `ogilgnvspwjvbvjdrxvw`)

### Migrations da Sessão 2 (todas aplicadas)

| Arquivo                                       | O quê                                                                              |
|-----------------------------------------------|------------------------------------------------------------------------------------|
| `09_notifications_kind_params.sql`            | ADD `notifications.kind` + `params jsonb DEFAULT '{}'` + idx                       |
| `10_sessions_location_nullable.sql`           | `sessions.location DROP NOT NULL`                                                  |
| `11_distance_in_km.sql`                       | `calculate_distance` em km (6371), `get_profiles_within_radius(radius_km)`, default 25→50 |
| `12_casting_calls_country.sql`                | ADD `casting_calls.country text NOT NULL DEFAULT 'BR'` + idx                       |

Migrations 01–08 são pré-existentes (consolidated schema do shutter-muse). **Histórico timestamp-prefixed** (`20260303*`) também existe na pasta — não tocar; representam migrations já aplicadas que o Supabase CLI generou anteriormente.

### Linhas
**Todas as tabelas críticas têm 0 rows.** Sem backfill necessário. Confirmado via `SELECT COUNT(*) FROM notifications` etc. Isso simplifica TUDO: dá pra trocar defaults, dropar+recreate funcs, sem risco.

### Extensions
- `pg_net 0.20.0` instalado ✓ (usado pra testar edge functions de dentro do banco — ver "Gotchas").
- `pg_cron`, `pgcrypto`, `uuid-ossp`, `postgres_fdw`, `supabase_vault`, `pg_stat_statements`, `vector` — todos pré-existentes.

### Types
`src/integrations/supabase/types.ts` regenerado via MCP em 2 momentos: depois da migration 09/10 e depois manualmente após 11/12. Última versão tem `notifications.kind`, `notifications.params`, `sessions.location` nullable, `get_profiles_within_radius` com param `radius_km`, e `casting_calls.country`.

---

## 4. Edge Functions (deployed, ACTIVE no projeto)

| Function            | Versão | verify_jwt | Notas                                                              |
|---------------------|--------|------------|--------------------------------------------------------------------|
| `auth-email-hook`   | v2     | false      | Chamada pelo Supabase Auth Hook. Brand routing por user_metadata.  |
| `send-welcome`      | v2     | true       | Invocada pelo client após onboarding. Brand por profile.country.   |
| `send-reengagement` | v2     | false      | Cron-driven (service-role). Brand por profile.country por user.    |
| `send-email`        | v2     | true       | **LOCKED** (audit P1): `to` deve ser igual ao `user.email`.        |

**Outras 4 functions** (`admin-action`, `clean-expired-availability`, `delete-account`, `expire-castings`) **não foram tocadas** — ficam pra Fase 7 (cron auth header).

### Estratégia de deploy
O MCP `deploy_edge_function` aceita só flat file array. Os entrypoints importam de `../_shared/` que não viaja bem como path. **Solução:**

- `scripts/bundle-edge-fn.sh <function-name>` concatena `_shared/brand.ts` + `_shared/brevo.ts` + `_shared/templates/_layout.ts` + templates específicos + entrypoint, strippa imports/exports locais, vira UM arquivo Deno self-contained.
- Cada `build()` foi renomeado pra ser único (`buildConfirmationPT`, `buildWelcomeEN`, etc.) pra evitar colisão pós-concat.
- O arquivo bundled é passado como `files: [{name: "index.ts", content: <bundle>}]` na MCP call.
- Source files em `supabase/functions/_shared/` ficam multi-file pra manutenção; bundling acontece só no deploy.

### Brevo state
- `BREVO_API_KEY` **setada como secret no Supabase Edge Functions** ✓
- Sender `noreply@permutamodel.com.br` verificado no Brevo ✓
- DKIM/SPF/DMARC do domínio: confirmados no Brevo dashboard ✓
- Endpoint: `https://api.brevo.com/v3/smtp/email`
- Validação E2E: chamada via `pg_net` retornou `200 {"success":true,"messageId":"<...@smtp-relay.mailin.fr>","brand":"br"}` — magic link em PT-BR chegou no inbox do Jemson.

---

## 5. Arquitetura e convenções

### 5.1 Estrutura de pastas
```
src/
├── App.tsx                          ← Routes + brand-aware setup
├── pages/                           ← 1 file per route
│   ├── AuthCallback.tsx             ← PKCE handler (Fase 1)
│   ├── _dev/ComponentShowcase.tsx   ← DEV-only, /_dev/components
│   └── ...
├── components/
│   ├── ui/                          ← shadcn (47 primitives, 5 customizados)
│   ├── onboarding/                  ← StepAboutYou, StepCraft, StepShowWork
│   ├── castings/                    ← ApplyModal, ApplicationsModal, CreateCastingModal
│   ├── portfolio/PortfolioUploader.tsx
│   ├── sessions/SharedGallerySection.tsx
│   └── ProfileView.tsx, ErrorBoundary.tsx, etc.
├── hooks/                           ← useAuth, useTranslation, useBrand, useDevice
├── lib/                             ← brand.ts, strings.ts, styles.ts, brasilapi.ts,
│   │                                  brazil-states.ts, instagram.ts, geocoding.ts, tracking.ts, utils.ts
│   └── ...
└── integrations/
    └── supabase/                    ← client.ts + types.ts (regenerated)

supabase/
├── functions/
│   ├── _shared/
│   │   ├── brand.ts                 ← BRANDS map + brandFor()
│   │   ├── brevo.ts                 ← sendBrevoEmail + BrevoError
│   │   └── templates/               ← _layout.ts + 12 builder files
│   ├── auth-email-hook/
│   ├── send-welcome/
│   ├── send-reengagement/
│   ├── send-email/
│   └── (4 outras intocadas)
└── migrations/                       ← 09, 10, 11, 12 (Sessão 2) + ~28 timestamp-prefixed legados

scripts/
└── bundle-edge-fn.sh                ← Bundler pré-deploy MCP

PROMPT_SESSAO_2_CLAUDE_CODE_v2.md    ← Plano-mestre (ler INTEIRO)
AUDITORIA_REAL_2026-05-09.md         ← Auditoria do estado pré-Sessão 2
AGENT_MEMORY.md                       ← Este arquivo
```

### 5.2 Strings / i18n
- **Single source of truth:** `src/lib/strings.ts`. Define type `Strings` + dois objetos `EN` e `PT_BR`. Export legado `AppTranslations = Strings`.
- **Hook:** `useTranslation()` retorna o objeto inteiro do brand atual. Lookup runtime, O(1).
- **Namespaces (final):** `common, cta, errors, validation, styles, nav, auth, login, onboarding, onboardingShell, discover, dashboard, messages, chat, sessions, profile, settings, castings, castingsPage, castingDetail, editProfile, chatPage, notFound, resetPassword, profileCompletion, availability, achievements, errorBoundary, notifs, searchPage, favorites, notifications, tfp, reviews, modals`.
- **`notifs` namespace é especial:** cada chave é uma function `(params) => {title, body}` mapeada por kind. 9 kinds: `tfp_request_new, tfp_request_accepted, tfp_request_declined, application_new, application_accepted, application_declined, photo_like, photo_comment, gallery_shared`.
- **Voice rule:** dicionário Seção 5 do PROMPT_SESSAO_2 é autoritativo. Tu/teu (não você/seu). Sem "por favor" formal. Discover→"Início", Apply→"Tô dentro", Reviews→"Recadinhos", Error→"Deu ruim", Continue→"Bora", Portfolio→"Book".

### 5.3 Tokens de design (Paleta B)
- Definidos em `src/index.css` como CSS vars HSL no `:root` E `.dark` (mesmos valores, app força `.dark`).
- Tokens diretos: `--bg-base, --bg-surface, --bg-elevated, --text-primary/secondary/tertiary, --accent-warm (#FF6B4A coral), --accent-cool (#C9B4FF lavender), --on-accent-warm, --on-accent-cool, --danger, --border-strong`.
- Mapeados pro shadcn (`--primary, --secondary, etc.`) e adicionados ao Tailwind config em `tailwind.config.ts` como cores nomeadas (`coral, lavender, surface, elevated, ink, ink-secondary, ink-tertiary, border-strong`).
- **Fontes:** Sora (display) + Inter (body) + JetBrains Mono (admin). Loaded via Google Fonts em `index.html`. Playfair/Cormorant **removidas** (legacy CollabShoot).
- **5 shadcn customizados:** Button, Card, Badge, Input, Avatar. Outros 42 intocados.

### 5.4 Brand-aware routing
- Client: `useBrand()` → `brand.country, brand.lang, brand.name, brand.url, brand.primaryColor`.
- Server: `brandFor(country, lang)` em `_shared/brand.ts`. Mesma lógica.
- **Padrão de query "country-scoped":** sempre que listar profiles/castings/etc, filtra por `brand.country`. Casos já implementados: `Discover.tsx`, `Castings.tsx`, `CastingsTab.tsx` (sub-tab do Discover).

### 5.5 Styles (estilos de fotografia)
- **17 keys EN canônicas** em `src/lib/styles.ts` (`STYLE_KEYS`): `runway, commercial, fitness, maternity, kids, sensual, fashion, lifestyle, editorial, beauty, wedding, food, product, event, sports, newborn, graduation`.
- **DB persiste as keys EN** em `profiles.styles[]` e `casting_calls.styles[]`.
- **Display PT-BR** via `t.styles[key]` (`Passarela, Comercial, ...`). Helper `labelForStyle(key, t.styles)` cai pra key bruta se não conhecida (forward-compat).
- **Lista legacy CollabShoot** (`Portrait, Fashion, Editorial, ...`) ainda existe em alguns arquivos de filtro com comentário `// FASE 6 BR vocab — domain vocabulary, decision pending`. NÃO toque sem nova discussão — alguns são valores DB stored.

### 5.6 Cidades BR (Onboarding)
- `src/lib/brazil-states.ts` — 27 UFs hardcoded.
- `src/lib/brasilapi.ts` — fetchMunicipalities(uf) com timeout 3s, in-memory cache per UF, fallback hardcoded de ~80 cidades cobrindo todas 27 UFs (usado em timeout/erro).
- API endpoint: `https://brasilapi.com.br/api/ibge/municipios/v1/{UF}` — sem key, sem rate limit relevante.

### 5.7 Notifications
- Schema: `kind text` + `params jsonb DEFAULT '{}'` (+ legacy `title`, `body`).
- **Insert pattern**: cada um dos 9 sites grava AMBOS `kind+params` E `title+body` (legacy fallback).
- **Render** (`Notifications.tsx`): `resolveDisplay(notif, t.notifs)` — tenta `t.notifs[kind](params)`, fallback pra `row.title/body`. 3 caminhos de fallback (no kind, kind desconhecido, template throw).

### 5.8 Distância
- Sempre em **km** (Fase 6). DB function `calculate_distance` usa earth_radius=6371.
- RPC param: `radius_km` (renamed de `radius_miles`).
- Default `profiles.distance_radius`: 50 (era 25).

### 5.9 Castings
- `casting_calls.country` (NOT NULL DEFAULT 'BR') — todas queries filtram por country.
- `CreateCastingModal` escreve `country: brand.country` no insert.
- Status enum: `open, filled, expired, cancelled`. Locked.

### 5.10 PRO / Stripe
- **TODO upsell escondido pra Fase 6 launch.** ProPage.tsx fica no repo, rota `/pro` redireciona pra `/discover` via `<Navigate replace />`. Cards de upgrade em Dashboard/Discover/Settings + modal do PortfolioUploader **removidos**.
- Strings (`t.dashboard.proUpgradeTitle/Sub/Body`, `t.discover.seeMoreTitle/Body/upgradeToPro`) **preservadas** em strings.ts pra reativar em Sessão 5+.
- Limite de upload (>5MB no PortfolioUploader) continua existindo, mas agora vira só `toast.error(t.validation.maxFileSize(5))` sem modal upsell.

---

## 6. Fases — resumo executivo

### Fase 1 — Setup & Lovable cleanup
- Deletados `.lovable/`, `src/integrations/lovable/`, `bun.lock`, `bun.lockb`. Removidas deps `@lovable.dev/cloud-auth-js` + `lovable-tagger`. Limpo `componentTagger` do `vite.config.ts`. Tirado `lovable.app` de `brand.ts`.
- `useAuth.signInWithGoogle` reescrito pra `supabase.auth.signInWithOAuth({provider:'google', options:{redirectTo: \`${origin}/auth/callback\`, queryParams:{access_type:'offline', prompt:'consent'}}})`. `signUp.emailRedirectTo` também aponta pra `/auth/callback`.
- **Rota nova `/auth/callback`** (pública, sem ProtectedRoute): `src/pages/AuthCallback.tsx`. Faz PKCE `exchangeCodeForSession(code)` quando há `?code=` na URL, fallback pra `getSession()`. Erros via `error_description` no hash ou query → toast + `/login`. Sucesso → `/discover`.

### Fase 2 — Design System
- Paleta B (HSL CSS vars), Sora+Inter fonts, 5 shadcn primitives refatorados (Button, Card, Badge, Input, Avatar).
- **Cleanup pós-revisão:** `border` virou nested `{DEFAULT, strong}` no Tailwind; Avatar `seen` state usa `border-border-strong`. Fontes legacy (Playfair, Cormorant) removidas do index.html.
- **`src/pages/_dev/ComponentShowcase.tsx`** + rota `/_dev/components` (DEV-gated via `import.meta.env.DEV` em App.tsx — `ComponentShowcase` é null em prod, route só registrada se truthy). **DEVE SER REMOVIDO NA FASE 8.**

### Fase 3 — Strings system + voice migration
- `src/lib/translations.ts` deletado. Novo `src/lib/strings.ts` com type `Strings` + EN+PT_BR objects. `useTranslation` reescrito.
- **17 consumers atualizados.** Voz PT-BR refatorada per dicionário.
- Showcase ganhou seção "Strings sampler (PT-BR)" pra QA num só lugar.
- Componentes EN-only migrados: `AchievementBadges, AvailabilityToggle, ProfileCompletion, ErrorBoundary` (class — usa `getStrings(getBrand().lang)` direto), `CreateCastingModal`.
- Páginas EN-only migradas: `NotFound, ResetPassword, Onboarding, Castings, CastingDetail, EditProfile, Chat, Dashboard, Discover`.
- **Fix commit `578d04a`**: 5 ajustes de voz pós-validação humana (`castings.apply/applied/applyNow` separados; `profileCompletion.title` "Falta pouco pra terminar"; `errors.sessionExpired/permissionDenied` em tu; `notifs.application_accepted` em tu).
- **Fora de escopo, flagged:** constantes `STYLE_FILTERS / STYLES / STYLE_OPTIONS / ROLE_OPTIONS / DURATION_OPTIONS / DAYS / TIMES / SPECIALTIES` ficaram com comentário "// FASE 6 BR vocab". Algumas foram tratadas em Fase 6 (STYLE_KEYS), outras ainda pendentes.

### Fase 4 — Notification refactor (kind+params)
- Migration 09: `notifications.kind + params jsonb` + idx. Migration 10: `sessions.location DROP NOT NULL` (acompanhou P5 do user — "Not specified" em DB era anti-pattern).
- 9 inserts refatorados pra escrever `kind + params + (legacy title/body)`. `Notifications.tsx` renderiza via `resolveDisplay()` com 3 caminhos de fallback.
- `Sessions.tsx:183` mostra `{session.location || t.sessions.locationTBD}` ("A definir" PT / "To be decided" EN).
- Backfill: skipped (0 rows). Grouped notifs sintéticos sem kind → caminho legacy (não migrado por hora; Fase 8 follow-up).

### Fase 5 — Email Brevo migration + i18n + brand swap
- `supabase/functions/_shared/{brand,brevo}.ts` + `_shared/templates/_layout.ts` + 12 builders (`auth-confirmation_{pt,en}`, `auth-recovery_{pt,en}`, `auth-magiclink_{pt,en}`, `auth-emailchange_{pt,en}`, `welcome_{pt,en}`, `reengagement_{pt,en}`).
- Cada template exporta nome único (`buildConfirmationPT`, etc.) pra evitar colisão pós-bundling.
- 4 functions reescritas + deployed v2 (auth-email-hook, send-welcome, send-reengagement, send-email). **`send-email` LOCKED**: validate `to.toLowerCase() === user.email.toLowerCase()`, senão 403.
- Layout BR usa Paleta B dark + wordmark "● permutamodel" lowercase coral. Layout US legacy mantém cream-gold CollabShoot.
- **TODOs Jemson resolvidos** (não pendentes): `BREVO_API_KEY` setada, sender BR verificado, integração validada via `pg_net.http_post()` + `_http_response` table.

### Fase 6 — Onboarding + Pro hide + Castings country
- Migration 11: `calculate_distance` em km (earth_radius 3958.8→6371). `get_profiles_within_radius` param renamed `radius_miles`→`radius_km`. Default `distance_radius` 25→50.
- Migration 12: `casting_calls.country text NOT NULL DEFAULT 'BR'` + idx. Insert + queries filtram por `brand.country`.
- 4 libs novas: `brazil-states.ts` (27 UFs), `brasilapi.ts` (fetch+cache+fallback), `instagram.ts` (regex+normalize+format), `styles.ts` (17 STYLE_KEYS + labelForStyle).
- `StepAboutYou` ganhou UF dropdown + city autocomplete BrasilAPI brand-aware (BR only). Instagram opcional (`isValidHandle` regex `/^@?[\w.]{1,30}$/`, persisted sem `@`).
- `StepCraft` ganhou 17 estilos brand-aware com chips disabled+opacity aos 5 selecionados.
- `StepAvailability` i18n finalizado (mas é dead code — não importado em lugar nenhum; flagged pra delete em Fase 8).
- **PRO upsell hidden** brand-agnóstico (BR e US — Stripe não tá integrado em nenhum). Strings em strings.ts preservadas pra Sessão 5+.

---

## 7. PENDENTE — Fase 7 e Fase 8

### Fase 7 — Database P0 + Security
Per spec section 7 do `PROMPT_SESSAO_2_CLAUDE_CODE_v2.md`. **PRÓXIMA FASE A EXECUTAR.**

#### Migrations a criar e aplicar
- **`13_fix_photo_likes_duplicate_trigger.sql`** (P0 — descoberto na auditoria): `DROP TRIGGER IF EXISTS on_photo_like_change ON photo_likes` (trigger duplicado).
- **`14_fix_user_roles_rls.sql`**: a policy admin atual em `user_roles` tem self-reference quebrada. Spec rascunho:
  ```sql
  DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
  CREATE POLICY "Admins can view all roles" ON user_roles
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
    );
  ```
  **CUIDADO**: isso pode causar recursão se mal feito. Pode precisar de SECURITY DEFINER function ou usar `has_role()` que já existe.
- **`15_achievements_insert_policy.sql`**: **DECISÃO ABERTA** — service role only OU trigger automático? Jemson não decidiu ainda. **Recomendação pra discutir:** service role only (Edge Functions inserem após eventos como complete_session/leave_review) é mais explícito, evita lógica em trigger.
- **`16_rls_performance_optimization.sql`**: advisor flagou ~50 policies usando `auth.uid()` direto. Reescrever pra `(select auth.uid())`. Use Supabase MCP `get_advisors` pra pegar a lista exata. Grindy mas mecânico.

#### Edge functions (auth nas crons)
- Adicionar header check `x-cron-secret` validando contra env `CRON_SECRET` em `clean-expired-availability` e `expire-castings`.
- Atualizar SQL do `cron.schedule` que Jemson tem rodando pra incluir o header. **Jemson configura `CRON_SECRET` no Edge Functions secrets** — listar como TODO.

#### Frontend
- **`npm audit fix`** (sem `--force`) — 22 vulnerabilities pendentes da Fase 1 (3 low, 6 moderate, 13 high). Maioria deve resolver sem breaking change.
- Conferir `.env` em `.gitignore` (já está ✓) + `.env.example` (já existe ✓).

#### Commit final Fase 7
`fix(db,security): photo_likes trigger, user_roles RLS, lock send-email, auth crons, perf RLS, audit fix`

#### Estratégia recomendada Fase 7 (4 commits sequenciais)
1. Commit 7.1: Migrations 13 + 14 + 15 (DB P0 fixes) — aplicar via MCP, regenerar types se necessário.
2. Commit 7.2: Migration 16 (RLS performance) — pull `auth.uid()` → `(select auth.uid())`. Pode ser BIG diff.
3. Commit 7.3: Cron header auth — refatorar 2 functions + deploy via MCP.
4. Commit 7.4: `npm audit fix` + `.env.example` review.

### Fase 8 — Wrap-up
Per spec section 8.

#### Tasks
1. `npm run build` limpo (verificar warnings residuais).
2. `npm run test` passa (rodar vitest, ver se algo quebrou).
3. **Criar `PROGRESS_SESSAO_2.md`** na raiz com:
   - Resumo do que foi feito por fase
   - Pendências pra **Sessão 3**: Discover redesign com stories + bottom nav, Profile redesign, framer-motion animations, `index-br.html` regional, `manualChunks` Vite, code-split do Discover.tsx
   - Pendências pra **Sessão 4**: Capacitor iOS+Android, plugins nativos, deep link WhatsApp, voice notes, splash screens
   - **TODO pra Jemson**: setar `BREVO_API_KEY` (já feito), confirmar sender Brevo (feito), configurar OAuth Google no Supabase dashboard, decidir achievements policy (se ainda não decidido)
4. **Deletar `src/pages/_dev/ComponentShowcase.tsx`** + remover lazy import e rota em `App.tsx`.
5. **Deletar `src/components/onboarding/StepAvailability.tsx`** (dead code, não rendered).
6. Commit final: `docs: progress notes for sessão 2`.
7. **NÃO DAR PUSH NESSE COMMIT FINAL** — Jemson revisa e mergeia. (Diferente dos pushes intermediários da sessão, conforme combinado.)

#### Follow-ups menores acumulados (entram no `PROGRESS_SESSAO_2.md`)
- `StepAboutYou.tsx`: 3 strings hardcoded EN/PT (subtitle linha 104, "Add Photo" linha 120, "yourusername" placeholder linha 288). Migrar pra `t.onboardingShell.aboutYouSubtitle/addPhotoLabel/instagramPlaceholder`.
- `ApplyModal.tsx`, `ApplicationsModal.tsx`, `PortfolioGrid.tsx`, `SharedGallerySection.tsx`: toasts EN-only out-of-scope da Fase 3.
- Grouped notifs synthetic title em EN (Fase 4 deferred).
- `ComponentShowcase.tsx` no-op `.replace("var(--", "var(--")`.
- Constantes que sobraram em EN: `STYLE_FILTERS` em Castings.tsx, `STYLES` em CastingDetail.tsx, `STYLE_OPTIONS` em EditProfile.tsx, `SPECIALTIES` em Discover.tsx, `ROLE_OPTIONS / DAYS / TIMES / DURATION_OPTIONS / TYPE_OPTIONS` espalhadas. Decidir caso a caso: ou migrar pra usar `STYLE_KEYS` + `labelForStyle`, ou aceitar EN pra valores de query (URL params).
- `useRef` import unused em `useAuth.tsx` (pre-existing).
- `mi`/`km` no `EditProfile.tsx` template ainda hardcoded `"km"` string literal — deveria usar `t.discover.distanceUnit`.

---

## 8. Decisões abertas (não bloqueiam Fase 7)

1. **Achievements insert policy** — service role only OU trigger automático? Discutir com Jemson antes do commit 7.1.
2. **`RESEND_API_KEY` no Supabase Edge Functions secrets** — pode ser removida (legado pós-Brevo). Não bloqueia.
3. **`StepAvailability.tsx`** — deletar (recomendado) ou reintegrar no fluxo? Atualmente Onboarding pula direto pra StepShowWork sem coletar dias/horários. Se for reintegrar, mexer no orquestrador. Discutir antes de deletar pra confirmar.

---

## 9. Workflow & convenções de conversa com Jemson

### 9.1 Pause-per-fase
Cada fase tem múltiplos commits. **Sempre pause entre commits** mostrando:
- Diff resumido (`git diff --stat`)
- Resultado do build
- O que mudou em prosa curta
- Aguardar OK explícito antes do próximo commit

Quando começar uma fase nova, sempre **descrever o plano em 3-5 linhas** e esperar OK.

### 9.2 Padrão de perguntas (P1, P2, P3...)
Jemson costuma fazer perguntas numeradas pra alinhar antes de codar. Espera-se resposta concisa (2-3 linhas cada) com ✅/✏️/❌ e explicação curta. Não comece a codar até responder todas.

### 9.3 Decisões marcadas com "Pergunte"
Spec marca alguns pontos com "Pergunte". **Pause SEMPRE** e questione, não invente.

### 9.4 Strings novas que não estão no dicionário
**Pause e pergunte.** Não inventa. Dicionário Seção 5 é autoritativo. Strings óbvias (back, cancel, salvar) traduz direto.

### 9.5 Não pushar (regra original)
Spec original diz "NÃO dê push". MAS Jemson liberou push intermediário no Commit 1 da Fase 2 — usar token dele (ver Gotchas) pra cada commit que validar. **NUNCA dê push do commit final da Fase 8** — esse é reservado pro review humano antes do merge.

### 9.6 Acesso ao Supabase
**Tem MCP ativo.** Usa quando o sandbox bloqueia HTTP (`curl supabase.co` retorna 403 "Host not in allowlist"). Tools disponíveis:
- `mcp__800e0f25-...__execute_sql` — queries arbitrárias (DDL via apply_migration)
- `mcp__800e0f25-...__apply_migration` — DDL formal (registra no histórico)
- `mcp__800e0f25-...__deploy_edge_function` — deploy
- `mcp__800e0f25-...__generate_typescript_types` — regen types
- `mcp__800e0f25-...__get_advisors` — security advisor (vai precisar na Fase 7 pra lista de policies a otimizar)
- `mcp__800e0f25-...__get_logs` — edge function logs
- `mcp__800e0f25-...__list_extensions`, `list_tables`, `list_migrations`, etc.

---

## 10. Gotchas & lessons learned

### 10.1 Sandbox proxy git push retorna 403
- Comando padrão `git push -u origin <branch>` funciona no primeiro push de uma branch nova, depois passa a dar `HTTP 403` (corte do proxy do sandbox).
- **Solução:** Jemson forneceu um GitHub PAT (Personal Access Token) em mensagem. Padrão pra push:
  ```bash
  git push 'https://x-access-token:<JEMSON_PAT>@github.com/jamesht509/permutamodel.git' feat/br-launch-foundation 2>&1 | sed 's/github_pat_[A-Za-z0-9_]*/[REDACTED]/g'
  ```
- **NUNCA loga o token em texto plano.** Sempre `sed` pra redactear.
- Token NÃO está armazenado neste arquivo. Pede o Jemson se precisar.

### 10.2 Stop hook complica com proxy lag
Depois de cada push via token, o sandbox tem um hook que checa "unpushed commits" e às vezes reporta atraso (mostrando 1-2 commits "pendentes" mesmo quando já foram). **Solução: `git fetch origin feat/br-launch-foundation`** sincroniza o cache do proxy e o hook para de reclamar.

### 10.3 Sandbox bloqueia chamadas pra `supabase.co`
```
HTTP/2 403
x-deny-reason: host_not_allowed
```
- **Solução pra testar edge functions:** `pg_net.http_post()` de dentro do banco via MCP `execute_sql`, depois lê `net._http_response` table pra pegar status+body. Exemplo no histórico da conversa Fase 5.
- Pra puxar logs em vez de fazer chamada: MCP `get_logs(project_id, service="edge-function")`.

### 10.4 IPv6 não suportado no sandbox
`npm run dev` falha com `EAFNOSUPPORT: address family not supported :::8080` porque `vite.config.ts` tem `host: "::"`. **Solução:** `npm run dev -- --host 127.0.0.1`. Não comitar essa mudança — é só pro sandbox.

### 10.5 Deno não está instalado no sandbox
Sandbox bloqueia o install script. **Solução:** smoke test de edge functions = o próprio `deploy_edge_function` (se houver erro de syntax, deploy falha). Logs via MCP `get_logs`.

### 10.6 BrasilAPI no fetch local pelo navegador (ainda não testado fora do sandbox)
Em produção (browser de usuário BR), `brasilapi.com.br` é público. No sandbox dev local, NÃO foi testada porque sandbox bloqueia. Se o agente for testar de outra forma, mockar a função `fetchMunicipalities`.

### 10.7 Edge function deploy precisa de bundling pré
`deploy_edge_function` aceita só flat file array; relative imports `../_shared/...` quebram. **Solução:** `scripts/bundle-edge-fn.sh <function-name>` produz UM arquivo Deno self-contained com tudo inlinado. Cada `build()` foi renomeado pra ter nome único (`buildConfirmationPT`, etc.) pra evitar colisão.

### 10.8 Linter / system-reminders no .ts files
Durante a sessão, eu vi vários `system-reminder` informando que arquivos `_shared/templates/*` foram modificados "by a linter". Esses reminders são FALSE POSITIVES — o linter restaurou as definições `export interface` e `export function` que tinham sido renomeadas, mostrando o estado de antes do rename. **Ignora esses reminders** — não estão revertendo nada de fato. O conteúdo no disco está correto (verificado via grep dos exports renomeados em commits 5.2-5.4).

### 10.9 Profile.lang column não existe ainda
Spec menciona `profile.lang` mas a coluna não existe no schema. Brand routing usa `profile.country` + `user_metadata.lang/country`. Fase 6 (não 7) ou Sessão 3 talvez adicione a coluna.

### 10.10 `useTranslation()` retorna o objeto inteiro
NÃO é `t("key")`. É `const t = useTranslation(); t.discover.title`. Templates com params são functions: `t.notifs.tfp_request_accepted({name: "Maria"})` retorna `{title, body}`.

### 10.11 Schema regen não preserva edições manuais
`mcp__800e0f25-...__generate_typescript_types` retorna um types.ts FRESH baseado no schema atual. Cuidado pra não perder edições manuais (raras — só fazem sentido pra forward-compat de algo que ainda não está no schema, mas inevitável às vezes).

### 10.12 Dev server: `npm run dev` no sandbox
- Está rodando em `127.0.0.1:8080` (task bthns3b0f, iniciada em Fase 2). Pode ter sido morta entre sessões. Se sumir, restart com `npm run dev -- --host 127.0.0.1` em background.

---

## 11. Comandos úteis (cheat sheet)

```bash
# Build
npm run build

# Dev server (forçar IPv4 no sandbox)
npm run dev -- --host 127.0.0.1

# Test
npm run test

# Audit
npm audit
npm audit fix       # sem --force

# Git
git status -sb
git log --oneline -10
git fetch origin feat/br-launch-foundation       # sync proxy cache se o hook reclamar
git diff --stat
git diff --cached --stat
git push 'https://x-access-token:<TOKEN>@github.com/jamesht509/permutamodel.git' feat/br-launch-foundation 2>&1 | sed 's/github_pat_[A-Za-z0-9_]*/[REDACTED]/g'

# Bundle edge function pra deploy
./scripts/bundle-edge-fn.sh auth-email-hook > /tmp/bundle_auth.ts
# (depois passa o content via MCP deploy_edge_function)

# Supabase CLI (instalado em /usr/local/bin/supabase, versão 2.98.2 — NÃO linkado)
supabase --version
# supabase link NÃO foi rodado nesta sessão (Jemson disse pra deixar pra ele)
```

---

## 12. Decisões importantes que NÃO devem ser revertidas sem discussão

- **Default brand = BR** em `brandFor()` (server-side). Per spec 5.4.
- **Single source-of-truth pra strings = `src/lib/strings.ts`**. Não criar arquivos paralelos.
- **DB persiste valores EN-keyed** (styles, role enum, casting status enum). Display brand-aware.
- **`_shared/` em `supabase/functions/` é onde shared edge-fn code mora.** Deploy bundles via script, fontes ficam multi-file.
- **Showcase `/_dev/components` é DEV-only** via `import.meta.env.DEV`. Não comitar mudanças que vazem pro prod.
- **`send-email` está LOCKED** — qualquer mudança que aceite `to !== user.email` precisa de discussão de segurança.
- **Voice "tu" (não "você") em todo PT-BR.** Inconsistências viraram commit de fix dedicado (`578d04a`).
- **Notification kind+params >>> title/body legacy.** Novas notifs sempre escrevem ambos.
- **`profiles.country` é a fonte da verdade pra brand routing.** Não confiar em hostname client-side em decisões servidor.

---

## 13. Como começar a próxima sessão

1. **`cd /home/user/permutamodel`** (ou wherever o repo foi clonado).
2. **Ler este arquivo INTEIRO.** Sério.
3. **Ler `PROMPT_SESSAO_2_CLAUDE_CODE_v2.md`** seção 7 e 8 (Fases 7 e 8).
4. **`git log --oneline -25`** pra confirmar HEAD = `6834ec1`.
5. **Cumprimentar o Jemson** ("Salve, vou continuar de onde parou. Última coisa foi a Fase 6 completa…") e perguntar:
   - **Decisão pendente:** achievements insert policy — service role only ou trigger?
   - Se quer começar Fase 7 direto ou pausar pra rever algo da 6.
6. **Aguardar OK** antes de qualquer commit.
7. Padrão de cada commit: plano 3-5 linhas → OK → execute → build → diff resumido → commit → push via token → próximo OK.

---

## 14. Arquivos importantes (referência rápida)

| Path                                                  | Propósito                                                                |
|-------------------------------------------------------|--------------------------------------------------------------------------|
| `PROMPT_SESSAO_2_CLAUDE_CODE_v2.md`                   | Plano-mestre (autoritativo)                                              |
| `AUDITORIA_REAL_2026-05-09.md`                        | Auditoria do estado pré-Sessão 2                                         |
| `AGENT_MEMORY.md`                                     | Este arquivo                                                             |
| `src/lib/strings.ts`                                  | Single source-of-truth pra todas as strings (PT-BR + EN)                 |
| `src/lib/brand.ts`                                    | Brand detection client-side (hostname-based)                             |
| `src/lib/styles.ts`                                   | 17 STYLE_KEYS + labelForStyle helper                                     |
| `src/lib/brazil-states.ts`                            | 27 UFs                                                                    |
| `src/lib/brasilapi.ts`                                | Fetch municípios + cache + fallback                                       |
| `src/lib/instagram.ts`                                | Regex + normalize + format handle                                         |
| `src/hooks/useTranslation.tsx`                        | Hook (returns inteiro t.*)                                                |
| `src/hooks/useAuth.tsx`                               | Auth context + profile fetch                                              |
| `src/hooks/useBrand.tsx`                              | Brand singleton                                                           |
| `src/index.css`                                       | CSS vars Paleta B + legacy utilities (gold-text etc.)                     |
| `tailwind.config.ts`                                  | Paleta B tokens nomeados + fonts + radii + shadows                        |
| `vite.config.ts`                                      | Vite + PWA config (host "::"; override com --host 127.0.0.1 no sandbox)   |
| `src/integrations/supabase/types.ts`                  | DB types (regenerar via MCP após migrations)                              |
| `supabase/functions/_shared/brand.ts`                 | Brand routing server-side                                                 |
| `supabase/functions/_shared/brevo.ts`                 | Brevo REST client                                                         |
| `supabase/functions/_shared/templates/_layout.ts`     | Shared HTML email shell (brand-aware paletas)                             |
| `supabase/functions/_shared/templates/*_pt.ts/*_en.ts` | 12 builders                                                              |
| `scripts/bundle-edge-fn.sh`                           | Pre-deploy bundler                                                        |
| `src/pages/Onboarding.tsx`                            | 3-step onboarding orquestrador (StepAboutYou, StepCraft, StepShowWork)    |
| `src/pages/Discover.tsx`                              | Feed principal — usa `brand.country` + `radius_km`                        |
| `src/pages/Castings.tsx`                              | Casting list — country-scoped                                             |
| `src/pages/Notifications.tsx`                         | `resolveDisplay()` kind+params first, legacy fallback                     |
| `src/pages/_dev/ComponentShowcase.tsx`                | DEV-only QA page (DELETAR em Fase 8)                                      |

---

## 15. Versões instaladas no sandbox

- Node: (verificar com `node -v`)
- npm: 10.9.7 (notice avisa pra 11.14.1, não atualizado)
- Supabase CLI: 2.98.2 (instalado via binary em `/usr/local/bin/supabase`, NÃO linked)
- Deno: **não instalado** (sandbox bloqueia install)

---

## 16. Tom & estilo de resposta

Quando responder ao Jemson:
- Português coloquial-profissional.
- Listas curtas, marcadores ✅ / ❌ / ⚠️.
- Diffs sempre como `+X −Y` linhas + arquivos resumidos.
- Builds sempre confirmados com `✓ built in Xs`.
- Após push: SHA do novo commit.
- Pause obrigatória entre commits.
- Sem emojis excessivos. Um por bloco máximo.
- Não invente strings — pause e pergunta.
- Use as palavras do dicionário (Seção 5) sempre que aplicável.

---

Fim do documento. Última atualização: ao final da Fase 6 (`6834ec1`). Quando começar Fase 7, atualize a seção "REPO STATE" e adicione resumo da Fase 7 em "SESSION 2 PROGRESS". Mantenha este doc vivo.
