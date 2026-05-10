# CastLight — Varredura Completa do Sistema

**Data:** 2026-03-04  
**Objetivo:** Avaliar se o sistema está pronto para um beta público.

---

## ✅ Totalmente Funcional

| Feature | Arquivos | Status |
|---------|----------|--------|
| **Auth (Google + Email/Senha)** | `Login.tsx`, `useAuth.tsx`, `ResetPassword.tsx` | ✅ Login, cadastro, reset de senha, Google OAuth funcionando |
| **Onboarding (8 steps)** | `Onboarding.tsx`, `Step*.tsx` | ✅ Fluxo completo: role → info → craft → styles → about → portfolio → availability → show work |
| **Discover (feed infinito)** | `Discover.tsx` | ✅ Scroll infinito, filtros por role/style/city, cards com avatar e info |
| **Chat em tempo real** | `Messages.tsx`, `Chat.tsx` | ✅ Lista de conversas, mensagens em tempo real via Supabase Realtime, indicador de leitura |
| **TFP Requests** | `Dashboard.tsx`, `TfpRequestModal.tsx` | ✅ Enviar/receber/aceitar/recusar requests com notificação |
| **Reviews** | `ReviewModal.tsx` | ✅ Avaliação com 5 critérios + comentário, salva no banco |
| **Favorites** | `Favorites.tsx` | ✅ Favoritar/desfavoritar perfis, pastas de favoritos |
| **Notifications** | `Notifications.tsx` | ✅ Lista de notificações, marcar como lida, tempo real |
| **Portfolio** | `PortfolioGrid.tsx`, `PortfolioUploader.tsx` | ✅ Upload de fotos, reordenação, capa, compressão de imagem |
| **Casting Calls** | `Castings.tsx`, `CreateCastingModal.tsx` | ✅ Criar/listar castings, filtros, candidaturas |
| **Edit Profile** | `EditProfile.tsx` | ✅ Editar bio, avatar, localização, redes sociais, medidas |

---

## ⚠️ Funcional com Problemas Críticos

### 1. Settings — Toggles não salvam no banco
**Arquivo:** `Settings.tsx`  
**Problema:** Todos os toggles (notificações push, modo privado, mostrar online, dark mode) usam `useState` local. Ao sair da página, tudo reseta.  
**Impacto:** Usuário acha que configurou, mas nada persiste.  
**Solução:** Criar tabela `user_settings` ou adicionar colunas ao `profiles` e salvar via Supabase.

### 2. Pro Page — Upgrade sem pagamento real
**Arquivo:** `ProPage.tsx`  
**Problema:** O botão "Upgrade" muda o campo `plan` no perfil para `"pro"` sem nenhuma integração de pagamento (Stripe).  
**Impacto:** Qualquer usuário pode se tornar Pro gratuitamente.  
**Solução:** Integrar Stripe ou remover a funcionalidade até implementar pagamento.

### 3. Sessions — Botões decorativos
**Arquivo:** `Sessions.tsx`  
**Problema:**  
- Botão **SOS** → mostra toast mas não faz nada real (não envia alerta, não notifica contato de emergência)  
- Botão **Check-in** → atualiza campo no banco mas não há validação de localização  
- Botão **Share Location** → apenas mostra toast, sem lógica de compartilhamento  
**Impacto:** Funcionalidades de segurança prometidas mas não entregues.  
**Solução:** Implementar lógica real ou remover botões para o beta.

### 4. Bug: Review usa request_id em vez de session_id
**Arquivo:** `Dashboard.tsx` (linha 219)  
**Problema:** O `canReview` e o `ReviewModal` usam `r.id` (ID do TFP request) como `sessionId`, mas a tabela `reviews` tem FK para `sessions.id`.  
**Impacto:** Reviews podem ser órfãs ou falhar se a constraint for enforced.  
**Solução:** Criar session automaticamente ao aceitar TFP request, e usar o `session.id` real.

### 5. Casting → Session: Fluxo quebrado
**Arquivos:** `ApplicationsModal.tsx`, `Castings.tsx`  
**Problema:** Quando um fotógrafo aceita uma candidatura em um casting, o status muda para `accepted` mas **nenhuma session é criada** automaticamente.  
**Impacto:** O fluxo casting → sessão → review está desconectado.  
**Solução:** Ao aceitar application, auto-criar entry na tabela `sessions`.

### 6. SearchPage não conecta com filtros
**Arquivo:** `SearchPage.tsx`  
**Problema:** A página de busca tem campo de texto mas não passa os termos de busca como filtros para o Discover.  
**Impacto:** Busca não funciona como esperado.  
**Solução:** Conectar SearchPage com query params que Discover lê.

---

## 🔴 Código Morto / Sem Função

| Item | Arquivo | Problema |
|------|---------|----------|
| **NavLink component** | `NavLink.tsx` | Não é importado em nenhum lugar do projeto |
| **Rota `/` duplicada** | `App.tsx` (linhas 43 e 79) | Linha 43 renderiza `<Landing />`, linha 79 faz `<Navigate to="/discover" />` — a segunda nunca executa |
| **Catch-all `*` → Landing** | `App.tsx` (linha 80) | Deveria mostrar `<NotFound />` (que existe mas não é usado na rota catch-all) |
| **RateSessionModal** | `sessions/RateSessionModal.tsx` | Componente de review duplicado — `ReviewModal.tsx` já faz a mesma coisa |
| **Tabela `achievements`** | DB schema | Tabela existe no banco mas zero referências no frontend |
| **Tabela `shared_galleries`** | DB schema | Tabela existe no banco mas zero referências no frontend |
| **Tabela `emergency_contacts`** | DB schema | Tabela existe no banco, botão SOS existe, mas não há tela para cadastrar contatos |

---

## 📊 Tabelas do Banco — Status de Uso

| Tabela | Frontend | RLS | Status |
|--------|----------|-----|--------|
| `profiles` | ✅ Usado em todo lugar | ✅ | OK |
| `tfp_requests` | ✅ Dashboard, TfpRequestModal | ✅ | OK |
| `sessions` | ✅ Sessions.tsx | ✅ | ⚠️ Não auto-criada |
| `reviews` | ✅ ReviewModal, ProfileView | ✅ | ⚠️ Bug session_id |
| `messages` | ✅ Chat.tsx | ✅ | OK |
| `conversations` | ✅ Messages.tsx | ✅ | OK |
| `notifications` | ✅ Notifications.tsx | ✅ | OK |
| `photos` | ✅ Portfolio, ProfileView | ✅ | OK |
| `photo_likes` | ⚠️ Parcial (DB existe, frontend não implementa) | ✅ | Incompleto |
| `favorites` | ✅ Favorites.tsx | ✅ | OK |
| `casting_calls` | ✅ Castings.tsx | ✅ | OK |
| `applications` | ✅ ApplyModal, ApplicationsModal | ✅ | OK |
| `reports` | ⚠️ Botão existe mas lógica mínima | ✅ | Incompleto |
| `achievements` | ❌ Sem frontend | ✅ | Morto |
| `shared_galleries` | ❌ Sem frontend | ✅ | Morto |
| `emergency_contacts` | ❌ Sem frontend | ✅ | Morto |

---

## 🎯 Prioridade para Beta

### P0 — Bloqueia o lançamento
1. **Remover botões SOS/Check-in/Share Location** ou implementar lógica real
2. **Corrigir bug review → session_id** no Dashboard
3. **Settings devem persistir** no banco

### P1 — Importante mas não bloqueia
4. Conectar fluxo casting aceito → criação de session
5. Corrigir rota catch-all para usar NotFound
6. Remover rota `/` duplicada
7. Conectar SearchPage com filtros do Discover

### P2 — Limpeza
8. Remover `NavLink.tsx` (não usado)
9. Unificar `RateSessionModal` com `ReviewModal`
10. Decidir sobre `achievements`, `shared_galleries`, `emergency_contacts` — implementar ou remover tabelas

---

## Veredicto

> **O sistema NÃO está pronto para beta hoje.** Os P0 (botões de segurança falsos, bug de reviews, settings que não salvam) precisam ser resolvidos primeiro. O core de descoberta, chat e TFP requests funciona bem. Estimativa: **1-2 dias de trabalho** para resolver os P0 e P1.
