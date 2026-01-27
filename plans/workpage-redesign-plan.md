# Plano de Redesign da WorkPage - Timeline estilo Facebook

## Objetivo
Recriar totalmente o layout e design da `WorkPage.tsx` com foco em mobile, priorizando imagens/vídeos em largura total, utilizando cores do site da OX Services e seguindo a skill de frontend-design para uma estética distinta e premium.

## Análise Atual
- Página atual usa tema industrial (concreto, aço, madeira) com linha vertical grossa e pontos.
- Timeline ocupa coluna esquerda com cards expansíveis.
- Usuário considera o visual piorado e deseja layout totalmente novo.

## Direção Estética
- **Estilo**: Luxury/refined com toques editorial/magazine.
- **Princípios**: Limpeza visual, espaçamento generoso, tipografia distinta, hierarquia clara.
- **Foco mobile**: Imagens ocupam 100% da largura da tela, reduzir elementos desnecessários (linha vertical, legendas grandes).

## Paleta de Cores (OX Services)
- **Primary**: `#0B242A` (azul escuro)
- **Primary hover**: `#0f353d`
- **Background light**: `#f6f7f8` (cinza claro)
- **Background dark**: `#131d1f`
- **Acento**: `#0d8bf2` (azul aço) - para botões e destaques.
- **Texto claro**: `#ffffff`
- **Texto escuro**: `#131d1f`

## Wireframe (Mobile-first)

### Hero Section Compacta
- Fundo `bg-primary` com texto branco.
- Título da obra, status, datas (exibição simplificada).
- Progresso da obra como barra horizontal ou card.

### Conteúdo Principal (Stack Vertical)
1. **Card Progresso** – barra de progresso + estatísticas (dias, fotos, vídeos).
2. **Card Timeline** – componente Timeline redesenhado.
3. **Card Informações da Obra** – token, datas, equipe.
4. **Card Compartilhar Acesso** – link e botão copiar.
5. **Card Comentários** – seção de comentários existente.

### Timeline estilo Facebook
- Cada entrada é um card com:
  - Cabeçalho: Avatar (ícone do tipo) à esquerda, nome do autor e timestamp à direita.
  - Conteúdo: Título (opcional), mídia (imagem/vídeo) ocupando 100% da largura do card, descrição abaixo.
  - Rodapé: Ações (curtir, comentar, compartilhar, baixar) como ícones.
- Remover linha vertical e pontos.
- Animações de entrada suaves (fade-in, slide-up).

## Modificações Detalhadas

### 1. Criar arquivo de tema CSS (`src/styles/workpage-theme.css`)
- Definir variáveis CSS com a paleta OX Services.
- Classes utilitárias para cards, shadows, bordas.
- Estilos específicos para timeline (avatar, linha sutil).
- Animações (fade-in, slide-up).
- Importar no `index.html` ou via `import` no `WorkPage.tsx`.

### 2. Atualizar `WorkPage.tsx`
- Remover classes `industrial-bg`, `industrial-card`, `industrial-grid`.
- Substituir por classes Tailwind customizadas (`bg-primary`, `bg-background-light`, etc.).
- Reestruturar HTML para stack vertical em mobile, usando `flex-col`.
- Ajustar hero section: simplificar gradientes, usar fundo sólido.
- Manager seções como cards com `bg-white`, `shadow-md`, `rounded-xl`.
- Atualizar importação de CSS (remover industrial-theme.css, adicionar workpage-theme.css).
- Manager funcionalidades existentes (loading, error, copy link).

### 3. Redesenhar `Timeline.tsx`
- Remover a linha vertical (`absolute left-6 ...`) e pontos.
- Alterar estrutura de cada entrada:
  - Container principal: `flex` com avatar à esquerda.
  - Conteúdo principal: card com `ml-12` (espaço para avatar).
  - Avatar circular com ícone do tipo e cor de fundo baseada no tipo (usando cores da marca).
  - Cabeçalho com nome do autor e timestamp.
  - Mídia: `w-full` com `rounded-lg` (imagem) ou `aspect-video` (vídeo).
  - Descrição: texto pequeno abaixo da mídia.
  - Ações: linha de ícones com hover.
- Remover expansão de detalhes (ou manter apenas descrição truncada com "ver mais").
- Atualizar cores de tipo para usar paleta OX Services (ex: imagem → azul aço, vídeo → laranja madeira, nota → cinza concreto).
- Garantir responsividade: em mobile, avatar menor, card sem margens laterais excessivas.

### 4. Ajustar componentes relacionados
- `CommentSection.tsx` – manter consistência com cards.
- `UploadButton.tsx` – posicionamento flutuante ajustado para mobile.

### 5. Testes
- Verificar responsividade em diferentes tamanhos de tela (mobile, tablet, desktop).
- Garantir que cores e tipografia estejam consistentes.
- Testar funcionalidades (copy link, like, expand).

## Sequência de Implementação
1. Criar `workpage-theme.css` e importar.
2. Modificar `WorkPage.tsx` (estrutura geral e estilos).
3. Refatorar `Timeline.tsx` (novo design).
4. Ajustar `CommentSection` e `UploadButton` se necessário.
5. Testar e iterar.

## Considerações de Skill Frontend‑Design
- **Tipografia**: Usar `font-display` (Space Grotesk) para títulos, `font-body` (Noto Sans) para texto.
- **Motion**: Adicionar transições suaves em hover de cards, animação de entrada stagger.
- **Detalhes visuais**: Sombras sutis, bordas arredondadas consistentes, ícones com peso adequado.
- **Evitar genericidade**: Não usar Inter/Roboto, evitar gradientes purple‑white, criar identidade única.

## Próximos Passos
- Apresentar este plano para aprovação do usuário.
- Após aprovação, mudar para modo Code e implementar as modificações.
- Realizar testes e ajustes finos.