## Objetivo
Como admin, na aba **Users** do `/admin`, ter acesso rápido ao perfil público de qualquer usuário com um clique que abre a página `/profile/:id`.

## Estado atual
Hoje em `src/pages/Admin.tsx` (UsersTab) o card do usuário só expande/colapsa ao clicar. Existe um botão **View** escondido dentro do painel expandido (linha 313) que abre `/profile/{u.id}` em nova aba. Não há link visível na lista, e é necessário expandir antes para chegar nele.

## Mudanças propostas (apenas UI em `src/pages/Admin.tsx`)

1. **Adicionar um ícone "Abrir perfil" (ExternalLink) no header de cada linha de usuário**, ao lado do chevron de expandir.
   - Clique no ícone → navega para `/profile/{u.id}` (mesma aba, usando `useNavigate` do react-router) e faz `e.stopPropagation()` para não disparar o expand.
   - Tooltip: "Abrir perfil".

2. **Tornar o nome do usuário clicável** como link visual (cursor pointer + hover underline em `text-primary`) que também navega para `/profile/{u.id}` com `stopPropagation`.

3. **Mostrar o caminho do perfil em texto pequeno** (`/profile/{u.id}`) abaixo do email, em `text-[10px] text-muted-foreground font-mono`, para o admin enxergar/copiar o link.

4. **Manter o botão View existente** dentro do painel expandido (sem mudança), apenas trocando `window.open` para `navigate` para consistência (opcional — confirmar com usuário se prefere nova aba).

## Pergunta de confirmação
Abrir o perfil na **mesma aba** (navegação SPA) ou em **nova aba** (`window.open`)? O botão "View" atual usa nova aba.

## Arquivos afetados
- `src/pages/Admin.tsx` (somente UsersTab)

Sem mudanças em backend, RLS, banco ou outras partes do sistema.