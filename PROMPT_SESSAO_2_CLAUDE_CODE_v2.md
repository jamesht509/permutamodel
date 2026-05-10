# Sessão 2 — PermutaModel BR Launch Foundation (v2 — Brevo)

**Para:** Claude Code (sessão dedicada, repo `jamesht509/shutter-muse` clonado localmente)
**Branch base:** verificar branch atual antes de começar
**Branch de trabalho:** criar `feat/br-launch-foundation`
**Modo:** fasado, com aprovação humana entre fases
**Idioma de código/commits:** inglês. **UI/strings/comentários explicativos:** português brasileiro coloquial-profissional.

---

## 0. O que JÁ foi feito (não fazer de novo)

Antes de começar, quero te alinhar sobre o estado atual. **Não tente recriar isto, já está pronto:**

### Banco de dados Supabase (NOVO projeto)
- Project ref: `ogilgnvspwjvbvjdrxvw` (região sa-east-1, São Paulo)
- Project URL: `https://ogilgnvspwjvbvjdrxvw.supabase.co`
- 20 tabelas, 11 enums, 11 functions, 38 FKs, 60+ RLS policies, realtime ligado, 2 storage buckets, auth trigger criando profile no signup — **tudo já rodando**
- Histórico do banco tem 8 migrations aplicadas (`01_extensions_and_enums` até `08_realtime_storage_auth_trigger`). Suas migrations novas vão a partir de `09_*`.

### Edge Functions já deployadas (8 de 9)
`admin-action`, `auth-email-hook`, `clean-expired-availability`, `delete-account`, `expire-castings`, `send-email`, `send-reengagement`, `send-welcome`.

**MAS:** todas estão usando **Resend** (versão antiga, EN-only, brand CollabShoot, com bug de `lovable.app` URL rewrite no `auth-email-hook`). **Você vai REESCREVER as 4 functions de email na Fase 5 deste prompt** pra usar **Brevo + i18n + brand swap PermutaModel**, e dar redeploy.

A `seed-users` foi pulada de propósito (tem password hardcoded e email seed errado). Não tente criar.

### .env local (Jemson configura, você não toca)
```
VITE_SUPABASE_URL=https://ogilgnvspwjvbvjdrxvw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon key — Jemson coloca>
```

### Email provider: **Brevo** (não Resend)
- Domínio `permutamodel.com.br` já verificado no Brevo (DKIM/SPF/DMARC OK)
- Sender confirmado no Brevo: `noreply@permutamodel.com.br`
- Secret a configurar: `BREVO_API_KEY` (Jemson configura no Supabase Edge Functions Secrets)
- API endpoint: `https://api.brevo.com/v3/smtp/email`
- Docs: https://developers.brevo.com/reference/sendtransacemail

---

## 1. Contexto

Sou Jemson Marius, dono do projeto. Estamos pivotando o `shutter-muse` (que rodou como CollabShoot/PermutaModel) para um lançamento foco-Brasil sob o domínio `permutamodel.com.br`. A base de usuários EUA não engajou; tenho audiência grande e quente no Brasil agora, e queremos lançar enquanto a animação tá no pico.

**Antes de começar qualquer fase, leia obrigatoriamente:**
1. `AUDITORIA_REAL_2026-05-09.md` (raiz) — auditoria que você gerou na sessão anterior. É a verdade do estado do CÓDIGO atual. Use-a como mapa.
2. `package.json` — confirmar stack.
3. `src/lib/brand.ts` e `src/lib/translations.ts` — base atual de white-label e i18n.

Os audits antigos (`AUDIT_REPORT.md` raiz e `src/docs/AUDIT_REPORT.md`) estão **desatualizados**. Só consulte se a auditoria real referenciar.

---

## 2. Princípios de execução (não negociáveis)

1. **Não reescrever shadcn.** Sobrescrever tokens (Tailwind config + CSS vars) e customizar APENAS estes 5 componentes: `Button`, `Card`, `Badge`, `Input`, `Avatar`. Os outros 44 shadcn primitives ficam intocados.
2. **Não reorganizar estrutura de pastas.** Mexa só onde for estritamente necessário.
3. **Dark mode é default e único** na v1. Não implementar light mode agora.
4. **Trabalhe uma fase por vez.** Ao começar a fase, descreva o plano em 3–5 linhas e espere meu OK. Ao terminar, mostre diff resumido + resultado do build, commite, espere meu OK pra próxima.
5. **NÃO dê push.** Eu reviso a branch antes de mergear.
6. **Decisões de produto que afetam usuário → pause e me pergunte.** Marquei abaixo onde aplica.
7. **Não invente strings em português.** Use o dicionário da Seção 5 ou pergunte. Sem gíria pesada, sem formal de banco. Tom Nubank/iFood: amigo capaz.
8. **Commits convencionais** (`feat:`, `fix:`, `chore:`, `docs:`).
9. **Edge Functions deploy:** rode `supabase functions deploy <nome>` localmente após a Fase 5 (você já tem `supabase` CLI instalada e linkada ao projeto via `supabase link --project-ref ogilgnvspwjvbvjdrxvw`).

---

## 3. Paleta B (lock-in, não muda)

```css
--bg-base:        #14101F;  /* deep purple-charcoal — body bg */
--bg-surface:     #1F1A2E;  /* cards, modais, popovers */
--bg-elevated:    #2A2440;  /* hover, dropdowns, secondary surface */
--text-primary:   #F4F0FF;
--text-secondary: #A8A2BD;
--text-tertiary:  #6F6986;
--accent-warm:    #FF6B4A;  /* coral — CTA primary, focus, energy */
--accent-cool:    #C9B4FF;  /* lavanda — secundário, badges, story rings */
--success:        #4ADE80;
--danger:         #F87171;
--warning:        #EF9F27;
--border:         #2D2640;
--border-strong:  #3D3556;
```

Texto sobre cor sólida: tom escuro do mesmo ramp (texto sobre `--accent-warm` = `#1A0A05`; sobre `--accent-cool` = `#2D1F5C`). Nunca preto/branco puro.

---

## 4. Tipografia

- Display (h1–h3, hero, logo): **Sora** weights 400/500/600
- Body: **Inter** weights 400/500 (já no projeto)
- Mono: **JetBrains Mono** (admin only)

Carregar Sora via Google Fonts em `index.html`. Fallback `@fontsource/sora`.

---

## 5. Voz BR — dicionário

| EN no app | PT-BR PermutaModel |
|---|---|
| Welcome | Salve, cola aqui |
| Welcome back | E aí, voltou! |
| Sign In | Entrar |
| Sign Up / Join Free | Faz teu cadastro |
| Create Account | Cria tua conta |
| Send TFP Request | Chamar pra permuta |
| TFP Request | Permuta |
| Request Accepted | Topou! |
| Request Declined | Não rolou dessa vez |
| Available Now | Tô na ativa |
| Casting Calls | Trampos |
| Casting | Trampo |
| Apply | Tô dentro |
| Reviews | Recadinhos |
| Schedule a shoot | Marcar o rolê |
| Portfolio | Book |
| Profile | Perfil |
| Discover | Início |
| Settings | Ajustes |
| Notifications | Avisos |
| Messages / DMs | DMs |
| Block | Bloquear |
| Report | Denunciar |
| Save / Favorite | Salvar |
| Share | Compartilhar |
| Continue | Bora |
| Back | Voltar |
| Cancel | Cancelar |
| Delete | Apagar |
| Edit | Editar |
| Save changes | Salvar alterações |
| Loading | Carregando |
| Try again | Tentar de novo |
| Error | Deu ruim |
| Success | Beleza |
| Empty (nothing here) | Tá vazio por aqui |
| Required | Obrigatório |
| Optional | Opcional |
| Confirm | Confirmar |

Tudo fora desse dicionário: traduza no mesmo registro. Se duvidar, **pergunte antes**.

---

## 6. Decisões abertas (perguntar a Jemson antes de tocar)

- **Fase 1:** existe rota `/auth/callback`? Se não, criamos ou usamos `window.location.origin`?
- **Fase 3:** `useTranslation()` hook ou import direto? (Recomendo hook.)
- **Fase 4:** quantos rows em `notifications`? Se <500, backfill; senão, deixa legado.
- **Fase 5:** templates HTML inline ou usar Brevo `templateId`? **Recomendo HTML inline em arquivos `.ts` separados por idioma**, mais simples e auto-contido. Se quiser templateId depois, é fácil migrar.
- **Fase 6:** fonte de cidades BR pra autocomplete — BrasilAPI, lista hardcoded das ~200 maiores, ou Google Places? Recomendo BrasilAPI. Lista de estilos ok ou ajusta?
- **Fase 7:** policy `INSERT` em `achievements` — service role only ou trigger? E `send-email`: deletar ou trancar?

---

## FASE 1 — Setup & Lovable Cleanup

**Objetivo:** branch nova, projeto limpo de Lovable, login Google funciona com Supabase puro.

1. Verificar branch atual. Criar `feat/br-launch-foundation`.
2. Deletar:
   - `.lovable/` (pasta)
   - `src/integrations/lovable/` (pasta)
   - `bun.lock`
   - `bun.lockb`
3. `package.json`:
   - `name`: `"permutamodel"`
   - Remover dependency `@lovable.dev/cloud-auth-js`
   - Remover devDependency `lovable-tagger`
4. `vite.config.ts`:
   - Remover `import { componentTagger } from "lovable-tagger"`
   - Remover plugin `mode === "development" && componentTagger()`
5. `src/lib/brand.ts`: em `detectBrand()`, remover `lovable.app` da checagem de hostname (manter `localhost`).
6. `src/hooks/useAuth.tsx`:
   - Remover `import { lovable } from "@/integrations/lovable/index"`
   - Reescrever `signInWithGoogle`:
     ```ts
     const signInWithGoogle = async () => {
       const { data, error } = await supabase.auth.signInWithOAuth({
         provider: 'google',
         options: {
           redirectTo: `${window.location.origin}/auth/callback`,
           queryParams: { access_type: 'offline', prompt: 'consent' },
         },
       });
       if (error) toast.error(error.message);
       return { data, error };
     };
     ```
   - Remover lógica de redirect específica de `lovable.app`/`lovableproject.com`
7. `npm install` — limpo
8. `npm run build` — limpo
9. Commit: `"chore: remove Lovable, restore native Supabase auth"`

**Pause.** Mostre diff resumido + resultado do build.

---

## FASE 2 — Design System (tokens + 5 componentes)

**Objetivo:** Paleta B aplicada, Sora carregada, 5 componentes refatorados.

1. Carregar Sora via Google Fonts (`index.html`) ou `@fontsource/sora` 400/500/600.
2. `tailwind.config.ts`:
   - `theme.extend.colors`: tokens da Paleta B (`bg.base`, `bg.surface`, `bg.elevated`, `text.primary`, `accent.warm`, `accent.cool`, `success`, `danger`, `warning`, `border`)
   - `theme.extend.fontFamily`: `display: ['Sora']`, `sans: ['Inter']`, `mono: ['JetBrains Mono']`
   - `theme.extend.borderRadius`: `sm: 8px, md: 12px, lg: 16px, xl: 24px`
   - `theme.extend.boxShadow`: `elevated: 0 8px 32px rgba(20,16,31,0.6)`, `focus-coral: 0 0 0 3px rgba(255,107,74,0.3)`, `glow-cta: 0 0 24px rgba(255,107,74,0.25)`
3. `src/index.css`: CSS vars Paleta B em `:root` e `.dark` (mesmos valores). Remapear shadcn tokens (`--background`, `--foreground`, `--primary`, etc.) pra Paleta B. `body { font-family: 'Inter', system-ui; background: var(--bg-base); color: var(--text-primary); }`.
4. Refatorar `src/components/ui/button.tsx`: variants `primary` (coral fill, dark text), `secondary` (lavanda outline), `ghost`, `destructive`. Sizes `sm/md/lg`. Tap `active:scale-[0.97] transition-transform`. Focus ring coral 30%.
5. Refatorar `card.tsx`: bg surface, border 0.5px, radius `lg`. Variant `photo-card` opcional.
6. Refatorar `badge.tsx`: variants `default/success/warning/info/coral/outline`. Suporta ícone à esquerda.
7. Refatorar `input.tsx`: bg surface, border 0.5px, focus ring coral. Props `error?: string` e `floatingLabel?: string`.
8. Refatorar `Avatar`: sizes `xs(24)/sm(32)/md(48)/lg(64)/xl(96)`. Prop `storyState?: 'none' | 'self' | 'unseen' | 'seen'` (self = dashed lavanda, unseen = solid coral, seen = solid border-strong, none = sem anel).
9. `npm run build` limpo.
10. Commit: `"feat: apply paleta B tokens, refactor 5 core ui components"`

**Pause.** Renderize amostra de cada componente novo.

---

## FASE 3 — Strings system & Voice migration

**Objetivo:** Toda string visível vem de `src/lib/strings.ts`. Voz BR consistente.

1. Criar `src/lib/strings.ts` com `EN` e `PT_BR` por namespace: `common`, `auth`, `onboarding`, `discover`, `profile`, `chat`, `castings`, `tfp`, `reviews`, `notifs` (cada chave é função `(params) => string`), `settings`, `errors`, `cta`.
2. Refatorar `useTranslation` (`src/hooks/useTranslation.tsx`) pra consumir `strings.ts`. Detectar lang via `useBrand().lang`.
3. Migrar páginas EN-only pra `t()`:
   - `Onboarding.tsx`, `Chat.tsx`, `EditProfile.tsx`, `Castings.tsx`, `CastingDetail.tsx`, `ResetPassword.tsx`, `NotFound.tsx`
4. Migrar componentes EN-only:
   - `AchievementBadges.tsx`, `AvailabilityToggle.tsx`, `ProfileCompletion.tsx`, `ErrorBoundary.tsx`, `CreateCastingModal.tsx`
5. Corrigir `Dashboard.tsx`: `getGreeting()` via `t.discover.greeting_*`, toasts via `t`, **notifications insertam `kind + params`** (não texto).
6. Corrigir `Discover.tsx`: tudo via `t`, section titles, filter labels, empty states.
7. Excluir `src/lib/translations.ts` antigo (ou re-export do novo).
8. Build limpo.
9. Commit: `"feat: centralize strings.ts with PT-BR voice, migrate 7 pages and 5 components"`

**Pause.** Liste namespaces criadas + screenshot do Onboarding em PT-BR.

---

## FASE 4 — Notification refactor

**Objetivo:** Notificações deixam de ser texto pré-traduzido no banco.

1. Migration nova (`09_notifications_kind_params.sql`):
   ```sql
   ALTER TABLE notifications
     ADD COLUMN IF NOT EXISTS kind text,
     ADD COLUMN IF NOT EXISTS params jsonb DEFAULT '{}'::jsonb;
   CREATE INDEX IF NOT EXISTS idx_notifications_kind ON notifications(kind);
   ```
2. Refatorar todo `from('notifications').insert(...)`. Em vez de gravar texto, gravar `{ user_id, kind: 'tfp_accepted', params: { name, request_id } }`.
3. Refatorar `Notifications.tsx`: ler `kind + params` e renderizar via `t.notifs[kind](params)`. Fallback se `payload` (legacy) existir.
4. Decisão (perguntar): backfill de rows antigas? Se <500, sim; senão, skip.
5. Build limpo.
6. Aplique a migration no projeto remoto via `supabase db push`.
7. Commit: `"feat: language-agnostic notifications via kind+params"`

---

## FASE 5 — Email Edge Functions: Resend → Brevo + i18n + brand swap

**Objetivo:** As 4 functions de email saem com brand PermutaModel, em PT-BR pros usuários BR, via Brevo. Reescritas do zero.

### 5.1 Cliente Brevo compartilhado

Criar `supabase/functions/_shared/brevo.ts`:

```ts
// Brevo REST API client for Deno (no SDK needed)
// Docs: https://developers.brevo.com/reference/sendtransacemail

export interface BrevoEmailPayload {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent: string;
  sender?: { email: string; name: string };
  replyTo?: { email: string; name?: string };
  tags?: string[];
  headers?: Record<string, string>;
}

export async function sendBrevoEmail(payload: BrevoEmailPayload): Promise<{ messageId: string }> {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) throw new Error("BREVO_API_KEY is not configured");

  const sender = payload.sender ?? {
    email: "noreply@permutamodel.com.br",
    name: "PermutaModel",
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender,
      to: payload.to,
      subject: payload.subject,
      htmlContent: payload.htmlContent,
      textContent: payload.textContent,
      replyTo: payload.replyTo,
      tags: payload.tags,
      headers: payload.headers,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${errorBody}`);
  }

  const json = await res.json();
  return { messageId: json.messageId };
}
```

### 5.2 Brand config compartilhado

Criar `supabase/functions/_shared/brand.ts`:

```ts
export type Brand = {
  name: string;
  url: string;
  fromEmail: string;
  fromName: string;
  unsubscribeEmail: string;
  lang: 'en' | 'pt-BR';
  primaryColor: string;
};

export const BRANDS: Record<'us' | 'br', Brand> = {
  us: {
    name: 'CollabShoot',
    url: 'https://collabshoot.com',
    fromEmail: 'noreply@collabshoot.com',
    fromName: 'CollabShoot',
    unsubscribeEmail: 'unsubscribe@collabshoot.com',
    lang: 'en',
    primaryColor: '#a67c3d',
  },
  br: {
    name: 'PermutaModel',
    url: 'https://permutamodel.com.br',
    fromEmail: 'noreply@permutamodel.com.br',
    fromName: 'PermutaModel',
    unsubscribeEmail: 'descadastrar@permutamodel.com.br',
    lang: 'pt-BR',
    primaryColor: '#FF6B4A',
  },
};

export function brandFor(country?: string | null, lang?: string | null): Brand {
  if (country === 'BR' || lang === 'pt-BR') return BRANDS.br;
  return BRANDS.us;
}
```

**IMPORTANTE sobre o Brevo BR sender**: O sender `noreply@permutamodel.com.br` precisa estar verificado no Brevo (Jemson confirmou que está). Se as functions falharem no envio, primeiro debug é checar Brevo dashboard → Senders & IP.

### 5.3 Templates HTML por idioma

Criar `supabase/functions/_shared/templates/`:
- `auth-confirmation_pt.ts` e `_en.ts` — exporta `function build({ url, email, brand }): { subject, html, text }`
- `auth-recovery_pt.ts` e `_en.ts`
- `auth-magiclink_pt.ts` e `_en.ts`
- `auth-emailchange_pt.ts` e `_en.ts`
- `welcome_pt.ts` e `_en.ts`
- `reengagement_pt.ts` e `_en.ts`

**Estrutura sugerida** (cada template):
```ts
import type { Brand } from "../brand.ts";

export interface TemplateInput {
  brand: Brand;
  email?: string;
  url?: string;
  firstName?: string;
}

export function build(input: TemplateInput): { subject: string; html: string; text: string } {
  // ... gera HTML responsivo + texto plain
}
```

**Cópia BR pros templates** — use o dicionário da Seção 5 e este registro:

- **welcome PT-BR:** assunto: `Salve, {firstName}! Bem-vindo ao PermutaModel`. Corpo: tom de amigo dando boas-vindas, lista 3 próximos passos ("Cria teu book", "Acha gente perto", "Manda a primeira permuta"), CTA "Bora começar".
- **auth-confirmation PT-BR:** assunto: `Confirma teu cadastro no PermutaModel`. Corpo curto: "Cola aqui pra ativar tua conta. É só clicar no botão abaixo." CTA "Confirmar email".
- **auth-recovery PT-BR:** assunto: `Resetar tua senha do PermutaModel`. Corpo: "Pediram pra resetar a senha do {email}. Se foi você, clica abaixo. Senão, ignora esse email — nada vai mudar." CTA "Criar nova senha". Disclaimer: "O link expira em 1h."
- **auth-magiclink PT-BR:** assunto: `Teu link de login no PermutaModel`. Corpo: "Clica abaixo pra entrar como {email}." CTA "Entrar". Disclaimer: "Link expira em 10 minutos."
- **auth-emailchange PT-BR:** assunto: `Confirma teu novo email`. Corpo: "Pediu pra mudar pro {email}? Clica pra confirmar." CTA "Confirmar mudança".
- **reengagement PT-BR:** assunto: `{firstName}, sentimos tua falta!`. Corpo: "Tem gente nova chegando perto de você. Bora dar uma olhada?". CTA "Voltar pro PermutaModel". Footer: "Não quer mais? [Atualizar preferências]".

**Design do HTML (todos os templates BR):**
- Background: `#14101F` (paleta B)
- Card: `#1F1A2E` com border-radius 16px, border 1px solid `#2D2640`
- Texto primário: `#F4F0FF`
- Texto secundário: `#A8A2BD`
- CTA: bg `#FF6B4A`, texto escuro `#1A0A05`, border-radius 12px, padding 14px 32px
- Brand mark no topo: ícone aperture coral + wordmark "permutamodel" (lowercase)
- Footer: `&copy; 2026 PermutaModel · [Termos](url/terms) · [Privacidade](url/privacy) · [Descadastrar](mailto:descadastrar@...)`
- Tabela-based layout (Outlook-safe), responsivo (max-width 520px)

### 5.4 Refatorar as 4 functions

**`supabase/functions/auth-email-hook/index.ts`** — invocada pelo Supabase Auth Hook:
- Remover Resend, usar `sendBrevoEmail`
- Remover regex que reescreve `lovable.app` URLs
- Detectar brand via `payload.user.user_metadata.lang` ou `payload.user.user_metadata.country`. Default: brand BR (porque alvo principal).
- Switch sobre `payload.email_data.email_action_type`: `signup`/`confirmation`/`recovery`/`magiclink`/`email_change`
- Importar template correto (`auth-confirmation_pt`, etc.) e chamar `build({ brand, email, url })`
- Disparar via `sendBrevoEmail` com tag `auth`

**`supabase/functions/send-welcome/index.ts`**:
- JWT-auth (header `Authorization: Bearer <user-jwt>`)
- Buscar `profiles.country` e `profiles.name` do `user.id`
- `brand = brandFor(profile.country, profile.lang)`
- Template `welcome_{brand.lang}` → `sendBrevoEmail`
- Tag `welcome`

**`supabase/functions/send-reengagement/index.ts`**:
- Service-role auth (chamada via cron com `Authorization: Bearer <service-role>`)
- Query: `profiles` inativos 48h+, não emailados em 15 dias, não banidos, não seed
- Pra cada usuário: `brand = brandFor(profile.country)`, template `reengagement_{brand.lang}`, `sendBrevoEmail`, marcar `last_reengagement_email_at`
- Tag `reengagement`. Limite diário 180.

**`supabase/functions/send-email/index.ts`**:
- **TRANCAR** o open-relay (audit P1): `to` deve ser igual ao email do user JWT, ou retorna 403.
- JWT-auth, valida que `body.to === user.email`
- `brand = brandFor(user metadata)`, `sendBrevoEmail` com tag `transactional`

### 5.5 Deploy

Após todos os arquivos criados/refatorados, rodar localmente:
```bash
supabase functions deploy auth-email-hook --no-verify-jwt
supabase functions deploy send-welcome
supabase functions deploy send-reengagement --no-verify-jwt
supabase functions deploy send-email
```

(`auth-email-hook` e `send-reengagement` rodam sem JWT porque são chamadas pelo Supabase Auth Hook e cron, respectivamente. Eles validam o body internamente.)

### 5.6 Validação

Não tem como testar email real sem `BREVO_API_KEY` setada (Jemson configura). Pelo menos confirma que:
- `supabase functions serve` roda local sem erros TypeScript
- `deno check` em cada arquivo passa

Commit: `"feat: migrate email functions to Brevo with i18n and PermutaModel brand"`

**TODO pra Jemson** (incluir no commit body):
- Setar secret `BREVO_API_KEY` em Supabase Dashboard → Edge Functions → Manage secrets
- Confirmar sender `noreply@permutamodel.com.br` ativo no Brevo dashboard
- (Opcional) Configurar segundo sender `descadastrar@permutamodel.com.br` se não existir
- (Futuro) Migrar pra Brevo `templateId` quando quiser editar templates visualmente sem redeploy

---

## FASE 6 — Onboarding novos campos + ProPage hide + Castings country filter

1. **Onboarding** (`src/pages/Onboarding.tsx`):
   - Step 1: campo `cidade` obrigatório com autocomplete. **Pergunte:** BrasilAPI (`https://brasilapi.com.br/api/ibge/municipios/v1/{UF}`), lista hardcoded das ~200 maiores, ou Google Places?
   - Step 2: `estilos` multi-select chips. Lista BR: `passarela, comercial, fitness, gestante, infantil, sensual, fashion, lifestyle, editorial, beauty, casamento, gastronomia, produto, evento, esportivo, recém-nascido, formatura`. **Pergunte se ajusta.**
   - Step 2 ou 3: campo `Instagram` opcional (validação `^@?[\w.]{1,30}$`)
   - Persistir nas colunas `cidade`, `estilos jsonb`, `instagram`. Migration nova se não existirem (provavelmente `instagram` já existe; verificar).
2. **ProPage hide**: comentar rota `/pro` em `App.tsx`. Remover/comentar links pra `/pro` em Dashboard, Layout, Settings. Não deletar `ProPage.tsx`.
3. **Castings filter**: em `Castings.tsx`, espelhar lógica do Discover: `where country = brand.country`.
4. Build limpo.
5. Commit: `"feat: BR onboarding fields, hide ProPage, country filter on castings"`

---

## FASE 7 — Database P0 + Security

1. Migration `10_fix_photo_likes_duplicate_trigger.sql`:
   ```sql
   DROP TRIGGER IF EXISTS on_photo_like_change ON photo_likes;
   ```
2. Migration `11_fix_user_roles_rls.sql`:
   ```sql
   DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
   CREATE POLICY "Admins can view all roles" ON user_roles
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM user_roles ur
         WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
       )
     );
   ```
3. Migration `12_achievements_insert_policy.sql` — **Pergunte primeiro.** Recomendo service role only (default) ou trigger automático.
4. **Lock `send-email`** já feito na Fase 5.
5. **Auth nas crons** — adicionar header check `x-cron-secret` validando contra env `CRON_SECRET` em `clean-expired-availability` e `expire-castings`. Atualizar SQL do `cron.schedule` que Jemson tem rodando pra incluir o header.
6. **Otimização performance RLS (do advisor)**: criar migration `13_rls_performance_optimization.sql` que reescreve as ~50 policies que usam `auth.uid()` direto pra usar `(select auth.uid())`. Isso é grindy mas o advisor flagou. Lista em `supabase advisors`.
7. `npm audit fix` (sem `--force`).
8. Garantir `.env` em `.gitignore`. Criar `.env.example` com placeholders.
9. Aplicar migrations via `supabase db push`.
10. Build/test limpos.
11. Commit: `"fix(db,security): photo_likes trigger, user_roles RLS, lock send-email, auth crons, perf RLS, audit fix"`

---

## FASE 8 — Wrap-up

1. `npm run build` limpo.
2. `npm run test` passa.
3. Criar `PROGRESS_SESSAO_2.md` na raiz com:
   - Resumo do que foi feito por fase
   - Pendências pra **Sessão 3** (Discover redesign com stories + bottom nav, Profile redesign, framer-motion animations, `index-br.html` regional, `manualChunks` Vite, code-split do Discover.tsx)
   - Pendências pra **Sessão 4** (Capacitor iOS+Android, plugins nativos, deep link WhatsApp, voice notes, splash screens)
   - **TODO pra Jemson**: setar `BREVO_API_KEY`, confirmar sender Brevo, configurar OAuth Google no Supabase dashboard se ainda não estiver, decidir achievements policy
4. Commit final: `"docs: progress notes for sessão 2"`
5. **NÃO dar push.** Reportar branch `feat/br-launch-foundation` pronta pra review.

---

## Workflow geral (resumo)

- **Início de fase:** plano em 3–5 linhas → espera meu OK
- **Fim de fase:** diff resumido + resultado do build → commit → espera meu OK
- **Decisões marcadas com "Pergunte":** sempre pause
- **Não pushar.** Eu reviso a branch.
- **Se descobrir algo no código que conflita com o plano**, pause e me conta antes de improvisar.

Bora.
