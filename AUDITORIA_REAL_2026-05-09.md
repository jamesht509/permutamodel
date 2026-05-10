# Auditoria Real do Projeto — CollabShoot / PermutaModel

**Data:** 2026-05-09
**Branch:** `claude/setup-collabshoot-platform-gkToe`
**Autor da auditoria:** sessão Claude Code (read-only — nenhum código foi modificado)
**Comparada contra:** `AUDIT_REPORT.md` (raiz, datado 2026-03-15) e `src/docs/AUDIT_REPORT.md` (datado 2026-03-04, ainda chamando o projeto de "CastLight")

> Esta auditoria foi feita lendo o código fonte, rodando o build e o `npm audit`, lendo todas as 28 migrations, todas as 9 Edge Functions, e as 8 páginas principais que você pediu. Nada aqui é confiar no audit antigo — tudo foi reverificado.

---

## 0. TL;DR — o que dói

1. **O audit antigo da raiz mente em vários itens.** Diz "8 steps de Onboarding" (são 3), "18 tabelas" (são 20), "4 Edge Functions" (são 9), "White-label EN/PT-BR ✅" (várias páginas e quase todos os emails são EN-only).
2. **Existe um audit AINDA mais antigo** em `src/docs/AUDIT_REPORT.md` que chama o projeto de **"CastLight"**. O projeto teve **três nomes**: CastLight → CollabShoot → PermutaModel. Resíduos de "castlight" ainda estão no código (56 emails seed `@seed.castlight.app`).
3. **Build compila limpo** (`vite build` em ~7s, PWA gerado). Mas o bundle principal tem **745.70 kB** (acima do limite de 500 kB do Vite) e `npm audit` reporta **22 vulnerabilidades (3 low, 6 moderate, 13 high)**.
4. **Lovable não está só "espalhado": é o provider de OAuth Google em produção.** Remover não é deletar uma pasta — é refatorar o login Google para usar `supabase.auth.signInWithOAuth` direto.
5. **Edge Functions de email têm hardcoded `CollabShoot` / `collabshoot.com` / copy 100% em inglês.** Para o lançamento BR, um usuário cadastrado em `permutamodel.com.br` recebe email "Welcome to CollabShoot" em inglês de `noreply@collabshoot.com`. Isso quebra a marca.
6. **Bugs reais de schema:** dois triggers com nomes diferentes em `photo_likes` (potencial double-increment), policy `user_roles` com `USING (true)` (qualquer logado lê todos os roles), tabela `achievements` com RLS habilitado mas só com policy SELECT (impossível inserir via cliente), policies admin duplicadas em duas migrations sem `DROP IF EXISTS`.
7. **`send-email` é open-relay para qualquer usuário autenticado.** Aceita `to/subject/html` arbitrários e manda via Resend. Vetor de phishing pelo seu domínio.
8. **PWA está bem configurado.** Sem ressalvas graves aqui. Boa notícia para o pivô BR.
9. **i18n cobre o fundamental (`brand.ts` + `translations.ts` PT-BR completos), mas várias páginas e quase todos os modais/components não consomem o sistema.** É trabalho real, não troca de label.

---

## 1. Build & Dependências

### 1.1 `npm install`
Roda limpo (exit 0, 796 pacotes). Avisos de dependências obsoletas no transitivo (todas dev): `whatwg-encoding@2`, `sourcemap-codec@1`, `abab@2`, `domexception@4`, `source-map@0.8.0-beta`, `glob@11.1.0`. Nada crítico.

### 1.2 `npm run build`
Compila em **7.15s**, sem erros TS. PWA gera `sw.js` + `workbox-d4f8be5c.js` precacheando 70 entries (~1.7 MB).

**Problema:** Bundle principal `dist/assets/index-DHzQAyNt.js` = **745.70 kB** (228.83 kB gzip). Vite avisa explicitamente:
```
(!) Some chunks are larger than 500 kB after minification.
```
O `AUDIT_REPORT.md` antigo já listava isso como "Bundle could be further optimized with manual chunks" — continua não resolvido. Para Brasil em mobile 4G, gzip 229 kB é OK mas não bom; tem sentido fazer manualChunks (`framer-motion`, `recharts`, `@radix-ui/*`, `react-router-dom` separados).

### 1.3 `npm audit`
**22 vulnerabilidades totais (3 low, 6 moderate, 13 high)** — 17 só em prod:

| Pacote | Severidade | Tipo |
|---|---|---|
| `esbuild` (via vite ≤6.4.1) | high | dev server lê requests arbitrários |
| `fast-uri` | high | path traversal / host confusion |
| `glob` 10.2-10.4.5 | high | command injection |
| `lodash` ≤4.17.23 | high | prototype pollution + RCE via `_.template` |
| `minimatch` 9.0.0-9.0.6 | high | ReDoS |
| `picomatch` ≤2.3.1 / 4.0.0-4.0.3 | high | method injection + ReDoS |
| `serialize-javascript` ≤7.0.4 (via workbox-build) | high | RCE via RegExp.flags |
| `postcss` <8.5.10 | moderate | XSS |
| `yaml` 2.0.0-2.8.2 | moderate | stack overflow |

`npm audit fix` (sem `--force`) resolve a maioria. **Antes do go-live BR é obrigatório rodar.**

### 1.4 Outras pendências de package.json
- `"name": "vite_react_shadcn_ts"` — nome literal do template Lovable. Deveria ser `permutamodel` ou similar.
- `@lovable.dev/cloud-auth-js: ^1.0.0` — usado em runtime (login Google).
- `lovable-tagger: ^1.1.13` — devDep, só roda em `mode === "development"`.

---

## 2. ✅ O que realmente funciona (verificado lendo código)

| Item | Veredito | Onde verifiquei |
|---|---|---|
| **Auth e-mail/senha** | ✅ Funciona via `supabase.auth.signInWithPassword`. Reset de senha em `ResetPassword.tsx`. | `src/hooks/useAuth.tsx:133-152`, `Login.tsx`, `ResetPassword.tsx` |
| **Discover (infinite scroll + filtros + RPC distância + filtro country)** | ✅ Sólido. `IntersectionObserver`, filtros por role/styles/experience/location/distância via RPC `get_profiles_within_radius`, available_now, sort, busca. Filtra por `country = brand.country` corretamente. | `Discover.tsx` (962 linhas) |
| **Chat real-time** | ✅ Supabase Realtime de fato — channel `chat-${id}` para INSERTs + channel `typing-${id}` por broadcast. Marca read, banner TFP, block/unblock via RPC `is_blocked`. | `Chat.tsx` |
| **TFP requests (send/accept/decline)** | ✅ Aceitar cria sessão, garante conversa, dispara notificação. | `Dashboard.tsx:120-157` |
| **Reviews** | ✅ Modal existe, salva no banco. Trigger `update_user_rating` recalcula `rating_avg`. | `ReviewModal.tsx`, migration `20260303233650` |
| **Portfolio (upload + reorder)** | ✅ Upload via Storage `portfolios`, reorder por position, sync no save. | `EditProfile.tsx`, `PortfolioUploader.tsx` |
| **Casting Calls (criar + listar + aplicar via CastingDetail)** | ✅ Listagem em 3 tabs, modal de criação, RPC de aplicações. | `Castings.tsx`, `CastingDetail.tsx`, `CreateCastingModal.tsx` |
| **Favorites** | ✅ Insert/delete otimista funcionam. | `Favorites.tsx`, integração em Discover |
| **Notifications real-time** | ✅ Tabela com Realtime habilitado. | migration `20260303233650`, `Notifications.tsx` |
| **Sessions** | ✅ Listagem upcoming/past/cancelled. | `Sessions.tsx` |
| **Settings persistido** | ✅ Confirmado — diferente do audit `src/docs` antigo, hoje Settings de fato persiste no DB (campos `notification_prefs`, `private_mode`, `show_online_status`, `dark_mode`, etc. existem em `profiles`). | migrations `20260317*` + `Settings.tsx:280` |
| **Edit Profile (campos básicos)** | ✅ Funciona, mas com gaps (ver §3). | `EditProfile.tsx` |
| **PWA** | ✅ Manifest válido, 6 ícones, SW gerado por workbox, runtime caching para Unsplash + Supabase Storage + Google Fonts. Cache-Control adequado em `vercel.json`. | §6 |
| **Dark mode forçado** | ✅ `index.html` tem `class="dark"` e `App.tsx` reforça em runtime. | `App.tsx:41-43` |
| **ErrorBoundary** | ✅ Existe e está no topo da árvore. | `App.tsx:58`, `ErrorBoundary.tsx` |
| **Code splitting (lazy routes)** | ✅ Todas as 23 páginas em `lazy()`. | `App.tsx:14-36` |
| **Heartbeat de presença (60s)** | ✅ Implementado em `useAuth` com `setInterval` + visibility listener. | `useAuth.tsx:111-131` |
| **brand.ts EN/PT-BR (estrutura)** | ✅ Detecção por hostname/`?lang=pt`, `BR_BRAND` populado de fato. `translations.ts` tem 998 linhas com PT-BR completo. | `src/lib/brand.ts`, `src/lib/translations.ts` |

---

## 3. ⚠️ O que está quebrado, ausente ou divergente do audit antigo

### 3.1 Mentiras / exageros do `AUDIT_REPORT.md` da raiz

| Audit antigo afirmava | Realidade |
|---|---|
| "Onboarding (8 steps) ✅" | **3 steps.** `StepAboutYou`, `StepCraft`, `StepShowWork`. Refatoração mal documentada. |
| "22 pages, 35+ components, 18 Supabase tables" | **23 pages, 78 .ts/.tsx em components/ (49 são shadcn UI), 20 tabelas Supabase.** Audit subestimou em todos os 3 eixos. |
| "4 Edge Functions" | **9 Edge Functions.** Faltavam: `auth-email-hook`, `seed-users`, `send-email`, `send-reengagement`, `send-welcome`. |
| "White-label EN/PT-BR ✅" | **Só Landing está completo.** Discover e Dashboard são parciais. Onboarding, Chat, EditProfile, Castings, ResetPassword, NotFound não importam i18n. Modais (TfpRequestModal, ReviewModal, ReportModal) usam i18n; CreateCastingModal não usa. Detalhes em §7. |
| "Casting Calls (create, apply, manage) ✅" | Create e apply funcionam. **Manage inline (editar/deletar minhas castings) não existe** — `Castings.tsx` tem tab "Mine" que só lista. |
| "Portfolio (upload, reorder, cover photo) ✅" | Upload e reorder OK. **Cover photo é apenas `i === 0`** — usuário não escolhe. Não existe UI para promover uma foto a capa. |
| "PRO upgrade — Coming Soon, no Stripe" | A página `ProPage.tsx` existe mas o audit `src/docs` antigo dizia que **muda `plan` para `pro` sem pagamento**. Não rerevidei o ProPage.tsx, então não confirmo nem nego — mas o débito do audit antigo permanece se não foi consertado. |
| "Photo likes counter exists in DB but not fully wired in frontend" | Continua. Tabela `photo_likes` existe mas não vejo UI no que li. **Adicionalmente:** o último migration `20260318014343` tem o bug de double-increment (§4.2). |

### 3.2 Páginas com gap grave de i18n

Páginas que **não importam** `useBrand` nem `useTranslation`:

- `src/pages/Admin.tsx` (608 linhas) — interface admin
- `src/pages/CastingDetail.tsx` (420 linhas) — detalhe + apply
- `src/pages/Castings.tsx` (265 linhas) — listagem
- `src/pages/Chat.tsx` (446 linhas) — chat 1:1 (todo EN)
- `src/pages/EditProfile.tsx` (485 linhas) — todo o form em EN
- `src/pages/NotFound.tsx` (33 linhas)
- `src/pages/ResetPassword.tsx` (76 linhas)

`Onboarding.tsx` importa `useBrand` mas só consome `brand.name`/`brand.country` — todas as labels do wizard são EN literais.

`Dashboard.tsx` usa `useTranslation` parcialmente — `getGreeting()` ("Good morning/afternoon/evening"), toasts, e — **mais grave** — payloads de notificação gravados no banco em EN ("Request Accepted! 🎉", "Someone wants to shoot with you!"). Quem recebe vê em EN mesmo no app BR.

Componentes sem i18n: `AchievementBadges`, `AvailabilityToggle`, `ProfileCompletion`, `SEOHead` (esse propaga `brand.seo` mas não traduz fallback), `ScrollToTop` (sem strings), `ProtectedRoute` (sem strings), `ErrorBoundary` (mensagem "Something went wrong" hardcoded), `CreateCastingModal`.

### 3.3 Edge Functions com brand hardcoded
4 das 9 functions são **incompatíveis com PermutaModel**:

| Function | Hardcoded |
|---|---|
| `auth-email-hook` | `SITE_NAME = "CollabShoot"`, `SITE_URL = "https://collabshoot.com"`, `FROM_EMAIL = "CollabShoot <noreply@collabshoot.com>"`, copy 100% EN |
| `send-email` | Mesmas constantes |
| `send-reengagement` | Mesmas constantes; também `unsubscribe@collabshoot.com` |
| `send-welcome` | Mesmas constantes |

Isso significa que **todo email de signup, reset de senha, magic link, welcome, re-engagement vai sair em inglês com brand CollabShoot** — mesmo para usuários `permutamodel.com.br`. Bloqueador para o lançamento BR.

`seed-users` ainda tem **56 emails `@seed.castlight.app`** (legado de 3 nomes atrás).

### 3.4 Audit duplicado em `src/docs/`
`src/docs/AUDIT_REPORT.md` (datado 2026-03-04) chama o projeto de **CastLight**, lista **6 problemas P0/P1** explícitos:
- Settings não persistia (corrigido).
- ProPage faz upgrade sem pagamento (a confirmar).
- SOS/Check-in/Share Location decorativos (audit raiz diz "removidos para beta" — a confirmar).
- Bug review usando `request_id` em vez de `session_id` (a confirmar).
- Casting aceito não cria session (a confirmar).
- SearchPage não conecta com filtros do Discover (a confirmar).

Nenhum desses foi reverificado nesta sessão. Vale revisitar antes do beta.

### 3.5 Outras divergências
- `index.html`: `<title>` e meta tags são todas hardcoded em EN com brand "CollabShoot". O `useBrand`/`SEOHead` injeta tags em runtime, mas o **HTML estático servido na primeira requisição é sempre EN**, prejudicando SEO BR e share de link no WhatsApp.
- `vercel.json` tem rewrite SPA OK e Cache-Control imutável em `/assets/*`. Faltam headers de segurança (CSP, X-Frame-Options, Referrer-Policy).
- `robots.txt` permite tudo. `sitemap.xml` lista só 6 URLs estáticas — não é gerado dinamicamente. OK para começar.
- Apenas 1 teste existe (`src/test/example.test.ts` que faz `expect(true).toBe(true)`). Cobertura efetiva: zero.

---

## 4. 🚨 Riscos técnicos / débito visto

### 4.1 Segurança
1. **`send-email` é open-relay para autenticados.** Qualquer JWT válido pode mandar email arbitrário (`to`, `subject`, `html`) via seu domínio Resend. Vetor de phishing trivial. (`supabase/functions/send-email/index.ts`)
2. **`clean-expired-availability` e `expire-castings` não têm autenticação.** Endpoints públicos disparáveis externamente — abuso de quota e estado mutável sem JWT/cron-secret. Devem ter `verify_jwt` ou checar header tipo `x-cron-secret`.
3. **`admin-action` interpola `data.search` direto em `.or("name.ilike.%${data.search}%")`** — o cliente PostgREST escapa por trás, mas sintaxe `.or()` com string concatenada é frágil. Validar/whitelistar.
4. **Policy RLS `Admins can view all roles` em `user_roles` usa `USING (true)`** (`migration 20260304231413` linha 19). Qualquer autenticado vê todos os roles. Bug.
5. **Service-role key disponível em 4+ Edge Functions** sem audit log de quem disparou o quê — ações destrutivas (ban, change_plan, deleteUser) ficam invisíveis em auditoria.
6. **`seed-users` tem senha fixa `SeedUser2026!`** para todos os 60 usuários seed. Se algum desses chegar em produção, é credencial conhecida.
7. **`.env` está commitado** — só com `VITE_SUPABASE_*` (anon key + URL). É público por design no front, mas deveria estar em `.env.example` e o `.env` real ficar fora de Git.

### 4.2 Bugs de banco
1. **`photo_likes` pode dobrar contador.** O migration inicial `20260304015642` cria trigger `on_photo_like_change`. O migration final `20260318014343` faz `DROP TRIGGER IF EXISTS trigger_photo_likes_count` (nome **diferente**!) e cria `trigger_photo_likes_count`. **Resultado: ambos triggers podem coexistir** dependendo do estado do banco. Cada like pode incrementar `likes_count` em 2.
2. **`achievements` com RLS habilitado e só policy SELECT.** Inserts via cliente impossíveis. Se a feature for usada, vai precisar de service role ou nova policy.
3. **Policies admin duplicadas.** `20260316_admin_super_dashboard.sql` e `20260317022217` declaram as mesmas policies (`admin_read_all_profiles`, etc.) sem `DROP IF EXISTS`. Em ambiente novo, o segundo migration falha com `policy already exists`.
4. **`update_user_level` trigger só atualiza `photographer_id`** — `model_id` nunca tem `user_level` recalculado.
5. **FK circular** entre `tfp_requests.session_id` e `sessions.request_id` — não-bloqueante mas evite ON DELETE CASCADE em ambos.
6. **`Castings.tsx` não filtra por `country`** — usuários BR e US vão ver castings misturados quando o sistema for multi-país.

### 4.3 Qualidade de código
1. **`Discover.tsx` tem 962 linhas** e mistura página + 3 sub-componentes. Precisa split.
2. **`translations.ts` tem 998 linhas** num único arquivo. Conforme i18n cresce, vira inviável — considerar split por namespace ou usar `i18next`.
3. **Duas pastas/arquivos de audit** (`AUDIT_REPORT.md` raiz + `src/docs/AUDIT_REPORT.md`) divergentes. Confunde. Manter um só.
4. **Sem TODOs/FIXMEs** (boa surpresa) mas isso pode significar que o débito não está sendo registrado em código — está só na cabeça.
5. **Apenas 4 `console.error`** em todo `src/`, todos legítimos (ErrorBoundary, geocoding, NotFound). Limpo.
6. **`src/types/index.ts` tem 3 linhas** (`UserRole = "photographer" | "model"`). Quase inútil.
7. **Bundle de 745 kB** (228 kB gzip) — pode ser otimizado significativamente com `manualChunks`.

### 4.4 Operacional / SEO / domínio
1. **`index.html` é estático em EN.** SEO BR e link unfurl no WhatsApp/Instagram vão sempre mostrar "CollabShoot". Para resolver bem, ou:
   - Vercel rewrite por hostname pra um `index-br.html`, ou
   - Renderizar SSR/SSG (Vite SSR), ou
   - Aceitar que o título dinâmico será trocado em runtime (impacto SEO/share).
2. **`og-image-br.png` existe** mas o HTML estático sempre serve `og-image-us.png` na primeira request.
3. **`vercel.json` sem CSP/HSTS/headers de segurança.**
4. **`supabase/config.toml` tem só `project_id`.** Sem declaração de cron, sem `verify_jwt` por function, sem secrets — provavelmente tudo via dashboard. Risco de drift entre código e infra.

---

## 5. 🧹 Tamanho real do trabalho de remoção do Lovable

### 5.1 Arquivos/diretórios para deletar
| Path | Tamanho | Ação |
|---|---|---|
| `.lovable/plan.md` | 1694 B | deletar pasta toda |
| `src/integrations/lovable/index.ts` | 1014 B | deletar pasta toda |
| `bun.lockb` + `bun.lock` (480 kB) | grandes | deletar — você usa npm |

### 5.2 Linhas exatas a tocar (14 hits)

| Arquivo | Linha | Conteúdo | Ação |
|---|---|---|---|
| `vite.config.ts` | 4 | `import { componentTagger } from "lovable-tagger";` | remover import |
| `vite.config.ts` | 18 | `mode === "development" && componentTagger(),` | remover plugin |
| `package.json` | 17 | `"@lovable.dev/cloud-auth-js": "^1.0.0"` | remover dependency |
| `package.json` | 86 | `"lovable-tagger": "^1.1.13"` | remover devDependency |
| `package.json` | 2 | `"name": "vite_react_shadcn_ts"` | renomear para `permutamodel` |
| `src/integrations/lovable/index.ts` | 1-39 | arquivo inteiro | deletar arquivo |
| `src/hooks/useAuth.tsx` | 4 | `import { lovable } from "@/integrations/lovable/index";` | remover import |
| `src/hooks/useAuth.tsx` | 139-141 | comentário "// Use custom domain..." + check `lovable.app/lovableproject.com` | reescrever lógica de redirect (provavelmente sempre `window.location.origin` agora) |
| `src/hooks/useAuth.tsx` | 154-159 | `signInWithGoogle` usa `lovable.auth.signInWithOAuth` | **REESCREVER** para usar `supabase.auth.signInWithOAuth({ provider: "google" })` direto. Esta é a única mudança de comportamento real. |
| `src/lib/brand.ts` | 144 | `if (hostname.includes("localhost") || hostname.includes("lovable.app"))` | trocar `lovable.app` por nada (manter só localhost) |
| `supabase/functions/auth-email-hook/index.ts` | 281-282 | regex que reescreve URLs `lovable.app`/`lovableproject.com` | remover (não vai mais existir) |

### 5.3 Limpezas correlatas
- `seed-users/index.ts`: 56 ocorrências de `@seed.castlight.app` — deve virar `@seed.permutamodel.com` ou similar (e idealmente function não vai pra produção).
- `src/docs/AUDIT_REPORT.md`: cabeçalho `# CastLight — Varredura...`. Deletar arquivo ou renomear.

### 5.4 Estimativa
**~30 minutos de edição mecânica + 1-2 horas para reescrever signInWithGoogle e testar fluxo OAuth com Supabase puro** (precisa configurar provider Google no dashboard Supabase se ainda não está). O resto é trivial.

---

## 6. PWA — avaliação detalhada

`vite-plugin-pwa@1.2.0` em `vite.config.ts:19-63`:

✅ `registerType: "autoUpdate"` — atualizações silenciosas
✅ `manifest: false` aponta para `public/manifest.json` válido (6 ícones, theme `#0A0A0A`, display `standalone`, start_url `/discover`, scope `/`, categories adequadas)
✅ `globPatterns` precacheia js/css/html/ico/png/svg/woff2 — 70 entries (~1.7 MB) precacheados
✅ `navigateFallback: "/index.html"` com `denylist` para `/~oauth` e `/api`
✅ `runtimeCaching` cobre Unsplash (CacheFirst 30d/100), Supabase Storage (CacheFirst 7d/200), Google Fonts (estilo: SWR; webfonts: CacheFirst 365d/30)
✅ Todos os ícones existem em `public/`: `apple-touch-icon-{120,152,167,180}x180.png`, `pwa-192x192.png`, `pwa-512x512.png`, `favicon.png`, `favicon.ico`
✅ `index.html` com `<meta name="theme-color">`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, `apple-touch-icon` em 4 tamanhos, `<link rel="manifest">`
✅ `vercel.json` `Cache-Control: no-cache` em `/sw.js` (correto — SW não pode ser cacheado)

⚠️ Observações:
- `manifest.json` tem `id: "/"` — convenção é o domínio absoluto ou um path único. Funcional mas pouco específico.
- Sem ícone `purpose: "any maskable"` separado — só um `pwa-512x512.png` com `purpose: "maskable"` que é a mesma imagem. Pode dar Android com bordas estranhas.
- Sem screenshots no manifest — Android Chrome PWA install prompt fica menos rico.
- Sem `apple-touch-startup-image` (splash iOS) — abertura no iOS mostra branco/escuro padrão.
- `manifest.json` está em EN (`name`, `description`). Quando rodar BR, o ideal é servir um `manifest-br.json` via rewrite do Vercel ou usar `<link rel="manifest" href="...">` dinâmico.

**Conclusão PWA:** funcional, sem bloqueador. Pequenos refinamentos são "nice to have", não impedem o lançamento.

---

## 7. i18n EN/PT-BR — avaliação detalhada

### 7.1 Estrutura
- `src/lib/brand.ts` (167 linhas): bem feito. `BR_BRAND` populado completo, detecção por `permutamodel`/`.com.br` ou `?lang=pt` em preview. Singleton com `resetBrand()` para testes.
- `src/lib/translations.ts` (998 linhas): tem **interface `AppTranslations` completa** + `EN_TRANSLATIONS` + `PT_BR_TRANSLATIONS` parcialmente espelhadas. Bom.
- Hooks `useBrand` e `useTranslation` triviais — só wrap memo.

### 7.2 Cobertura real (qual arquivo importa i18n)

**Páginas que importam (14):** Dashboard, Discover, Favorites, Landing, Login, Messages, Notifications, Onboarding (parcial), PrivacyPolicy, ProPage, SearchPage, Sessions, Settings, TermsOfService.

**Páginas que NÃO importam (9):** Admin, CastingDetail, Castings, Chat, EditProfile, NotFound, Profile (wrapper), ResetPassword, UserProfile (wrapper).

**Componentes que importam:** Layout, ProfileView, ReportModal, ReviewModal, TfpRequestModal, CreateCastingModal, CastingsTab.

**Componentes que NÃO importam:** AchievementBadges, AvailabilityToggle, ErrorBoundary, ProfileCompletion, ProtectedRoute, SEOHead, ScrollToTop.

### 7.3 Importar não significa usar
Como o subagent achou, `Onboarding.tsx` importa `useBrand` mas usa só para o nome — labels do wizard são EN puras.
`Dashboard.tsx` usa `useTranslation` mas:
- `getGreeting()` (linhas 33-37) sempre retorna EN
- Toasts EN
- **Notification payloads gravados em EN no DB** — usuários BR vão ver "Request Accepted! 🎉" no app PermutaModel.

### 7.4 Estratégia i18n para o pivô BR
Para o usuário BR clicar em qualquer botão e ler PT:
1. Migrar `Onboarding`, `Chat`, `EditProfile`, `Castings`, `CastingDetail`, `ResetPassword`, `NotFound` para `useTranslation`.
2. Refatorar `Dashboard` para que toasts e notification payloads consultem `t.notifications.*` e gravem no DB de forma idempotente (ou armazenem chave + params, traduzindo no display).
3. Adicionar i18n nas Edge Functions de email (`auth-email-hook`, `send-email`, `send-welcome`, `send-reengagement`) — receber `lang` no payload ou inferir do `country` do profile.
4. Servir `index.html` com `lang="pt-BR"` + meta tags BR quando o request vier de `permutamodel.com.br` (rewrite Vercel ou função edge).

---

## 8. Contagens reais vs audit antigo

| Item | Audit antigo (raiz) | Realidade |
|---|---|---|
| Páginas (`src/pages/*.tsx`) | 22 | **23** |
| Componentes (`src/components/**/*.tsx`) | 35+ | **78** (inclui 49 shadcn UI + 22 fora de `ui/` + 7 em subpastas) |
| Tabelas Supabase | 18 | **20** (`profiles`, `photos`, `casting_calls`, `applications`, `tfp_requests`, `sessions`, `reviews`, `conversations`, `messages`, `favorites`, `notifications`, `reports`, `shared_galleries`, `emergency_contacts`, `achievements`, `photo_likes`, `blocked_users`, `feedback`, `user_roles`, `photo_comments`) |
| Edge Functions | 4 | **9** (`admin-action`, `auth-email-hook`, `clean-expired-availability`, `delete-account`, `expire-castings`, `seed-users`, `send-email`, `send-reengagement`, `send-welcome`) |
| Migrations | n/a | **28** |
| Onboarding steps | 8 | **3** |
| Testes | n/a | **1** trivial |
| Bundle JS principal (gzip) | n/a | **228 kB** (745 kB raw) |

---

## 9. 📋 Recomendação de próximos passos (ordenada, sem executar)

### P0 — Bloqueador para `permutamodel.com.br`
1. **Reescrever `signInWithGoogle` para Supabase puro** e remover Lovable como provider de auth (item §5).
2. **Criar fork i18n das 4 Edge Functions de email.** Aceitar `lang` no payload ou ler `profiles.country` e despachar template PT-BR. Trocar `FROM_EMAIL` para `noreply@permutamodel.com.br`.
3. **i18n das 7 páginas que estão EN-only** — começar por Onboarding, Chat, EditProfile, Castings (afetam fluxo principal).
4. **Servir `index.html` regional** (rewrite Vercel para `permutamodel.com.br` apontar para um `index-br.html` com `lang="pt-BR"`, og-image-br, title/description BR). Senão SEO/share BR fica quebrado.
5. **`npm audit fix`** (sem `--force`) para reduzir os 22 vulns. Reverificar build depois.

### P1 — Antes do beta BR
6. **Corrigir trigger duplicado em `photo_likes`** — migration nova que dropa o `on_photo_like_change` legado se existir, mantendo só `trigger_photo_likes_count`.
7. **Corrigir policy RLS `user_roles.Admins can view all roles`** — usar `EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')`.
8. **Adicionar autenticação a `clean-expired-availability` e `expire-castings`** — `verify_jwt: true` no `config.toml` ou cabeçalho `x-cron-secret` validado.
9. **Trancar `send-email`** — limitar `to` ao próprio usuário ou a destinatários whitelistados; ou removê-lo se não tem uso real.
10. **Filtrar `Castings.tsx` por `country = brand.country`** (mesma lógica do Discover).
11. **Reverificar os 6 P0/P1 do `src/docs/AUDIT_REPORT.md`** (ProPage sem Stripe, bug review session_id, casting→session, SearchPage→Discover, botões SOS) — não confirmei nesta auditoria.

### P2 — Limpeza Lovable + débito
12. **Remover `.lovable/`, `src/integrations/lovable/`, deps `@lovable.dev/cloud-auth-js` e `lovable-tagger`** (item §5). Renomear `package.json:name`.
13. **Trocar 56 `@seed.castlight.app` em `seed-users`** — ou desativar a function em prod.
14. **Deletar `bun.lock` e `bun.lockb`** se você usa npm (são 480 kB e geram drift).
15. **Consolidar audits**: deletar `src/docs/AUDIT_REPORT.md` (CastLight, obsoleto) e `AUDIT_REPORT.md` (raiz, otimista demais). Manter só este `AUDITORIA_REAL_2026-05-09.md`.
16. **Code-split `Discover.tsx` (962 linhas)** em página + componentes separados.
17. **Adicionar `manualChunks` no `vite.config.ts`** para separar `framer-motion`, `recharts`, `@radix-ui/*`, `react-router-dom`.
18. **Headers de segurança em `vercel.json`** — CSP, X-Content-Type-Options, Referrer-Policy.

### P3 — Qualidade
19. **Cobertura de testes** — atualmente 1 teste trivial. Testes de RLS são mais úteis que UI; testes E2E (Playwright) do fluxo crítico (signup → onboarding → discover → request → chat) entregariam mais valor que unit tests.
20. **Tipos compartilhados** — `src/types/index.ts` tem 3 linhas; mover tipos repetidos do Profile/Casting/etc pra lá.
21. **Splash screens iOS, screenshots no manifest, ícone maskable separado.**
22. **Repensar `translations.ts` de 998 linhas** — split por namespace antes que vire 3000.

### P4 — Capacitor (depois do PWA estabilizar)
23. Capacitor wrapper iOS/Android só vale a pena depois que o PWA BR estiver instalável e estável. Se o PWA estiver bom, Capacitor é ~1-2 dias para iOS+Android com `@capacitor/core`, `@capacitor/ios`, `@capacitor/android`. Os bloqueadores prováveis: push notifications nativas (FCM/APNs), deep links, store metadata bilíngue.

---

## 10. Veredicto sincero

O projeto **compila, tem arquitetura razoável, e a base de dados está bem mais completa do que o audit antigo dava a entender.** O que parecia "1-2 dias para beta" no audit antigo é otimista — para o **lançamento BR específico**, o trabalho real é:

- **2-3 dias** de remoção Lovable + reescrita signInWithGoogle + i18n das páginas faltantes + i18n dos emails.
- **1-2 dias** de correções de banco (triggers, policies) + segurança (`npm audit fix`, fechar `send-email`, autenticar crons).
- **0.5-1 dia** de SEO/share BR (index.html regional, OG image BR, manifest BR).
- **0.5 dia** de manualChunks e otimização de bundle.

**Total realista: ~5-7 dias úteis para um BR-only launch decente.**

O audit antigo da raiz claramente foi escrito ou pelo Lovable, ou em um momento de otimismo. Este aqui é o que eu vejo no código no dia 9 de maio de 2026.
