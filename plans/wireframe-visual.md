# Wireframe Visual - WorkPage Luxury/Refined

## Visão Geral do Layout

### Mobile (viewport < 768px)
```
┌─────────────────────────────────────┐
│  [HERO]                             │
│  ┌─────────────────────────────┐    │
│  │ Título da Obra              │    │
│  │ Cliente • Status • Datas    │    │
│  │ [======= 65% =======]       │    │
│  └─────────────────────────────┘    │
│                                      │
│  [PROGRESSO]                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│  │ 42  │ │ 18  │ │  7  │ │ 23  │    │
│  │dias │ │fotos│ │vídeos│ │rest.│    │
│  └─────┘ └─────┘ └─────┘ └─────┘    │
│                                      │
│  [TIMELINE]                          │
│  ┌─────────────────────────────┐    │
│  │  ○ JS                       │    │
│  │  │ Fundação concluída       │    │
│  │  │ [imagem]                 │    │
│  │  │ 3 curtidas • 2 comentários│   │
│  │  └──────────────────────────┘    │
│  │  ○ MR                           │
│  │  │ Instalação elétrica         │
│  │  │ [vídeo]                     │
│  │  │ 5 curtidas • 1 comentário   │
│  │  └──────────────────────────┘    │
│  └─────────────────────────────┘    │
│                                      │
│  [COMENTÁRIOS]                       │
│  ┌─────────────────────────────┐    │
│  │  ● Carlos Santos            │    │
│  │    Ótimo progresso!         │    │
│  │  ● Obra Admin               │
│  │    Reboco semana que vem.   │
│  │  [Adicionar comentário...]  │
│  └─────────────────────────────┘    │
│                                      │
│  [+](botão flutuante)                │
└─────────────────────────────────────┘
```

### Desktop (viewport ≥ 1024px)
```
┌──────────────────────────────────────────────────────────┐
│  [HERO]                                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Título da Obra                                     │  │
│  │ Cliente • Status • Datas • Progresso 65%          │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌───────────────────────────┐  ┌────────────────────┐   │
│  │  [TIMELINE]               │  │  [SIDEBAR]         │   │
│  │                           │  │  Informações da    │   │
│  │  ○ JS                     │  │  obra              │   │
│  │  │ Fundação concluída    │  │  Token: abc123     │   │
│  │  │ [imagem]              │  │  Equipe: avatares  │   │
│  │  │ 3 curtidas            │  │  Compartilhar link │   │
│  │  └───────────────────────┘  └────────────────────┘   │
│  │  ○ MR                                                 │
│  │  │ Instalação elétrica                               │
│  │  │ [vídeo]                                           │
│  │  │ 5 curtidas                                        │
│  │  └───────────────────────┘                           │
│  │                                                       │
│  │  [COMENTÁRIOS]                                        │
│  │  ┌─────────────────────┐                             │
│  │  │ Carlos Santos ...   │                             │
│  │  └─────────────────────┘                             │
│  └───────────────────────────┘                           │
│                                                           │
│  [+](botão flutuante)                                     │
└──────────────────────────────────────────────────────────┘
```

## Elementos de Design

### Cores
- **Fundo principal**: `#F8F9FA` (branco gelo)
- **Cartões**: `#FFFFFF` com borda `#E9ECEF`
- **Texto primário**: `#0A2A32` (azul escuro)
- **Texto secundário**: `#6C757D` (cinza)
- **Acentos**: `#C19A6B` (dourado) para linhas, botões, destaques.

### Tipografia
- **Títulos**: Playfair Display (serif) – tamanhos: 2.5rem (hero), 1.75rem (seção), 1.25rem (cartão).
- **Corpo**: Inter (sans-serif) – tamanhos: 1rem (padrão), 0.875rem (metadados).

### Espaçamento
- **Padding geral**: 24px (desktop), 16px (mobile)
- **Margin entre seções**: 32px (desktop), 24px (mobile)
- **Border radius**: 12px (cartões), 8px (botões), 50% (avatares)

### Timeline Visual
```
      ○  Avatar (40px)
      │  Linha vertical (2px, cor dourada)
      ▼
      ┌─────────────────────┐
      │ Título              │
      │ Metadados           │
      │ Conteúdo            │
      │ [Mídia]             │
      │ Ações               │
      └─────────────────────┘
```

### Componentes Chave

1. **Hero Section**
   - Imagem de fundo com overlay escuro.
   - Título em Playfair Display com peso 700.
   - Badges de status com fundo dourado.

2. **Progresso**
   - Barra horizontal com gradiente dourado.
   - Estatísticas em grid responsivo.

3. **Timeline Entry**
   - Avatar circular com iniciais (gradiente dourado).
   - Linha vertical conectando entradas.
   - Card com sombra sutil, bordas arredondadas.
   - Ações (curtir, comentar, compartilhar) como ícones.

4. **Comment Section**
   - Avatar pequeno (32px) com gradiente baseado no nome.
   - Input de comentário com placeholder elegante.

5. **Upload Button**
   - Botão circular fixo no canto inferior direito.
   - Gradiente dourado, sombra proeminente.
   - Modal com backdrop blur.

## Fluxo Interativo
- Hover em cartões: elevação sutil (`translateY(-2px)`).
- Hover em botões: alteração de cor de fundo.
- Clique em avatar: expandir perfil (opcional).
- Clique em mídia: abrir lightbox.

## Considerações de Responsividade
- Em mobile, a linha vertical da timeline fica mais próxima da borda.
- Avatares reduzem de 40px para 32px.
- Grid de estatísticas vira coluna única.
- Sidebar desaparece (conteúdo movido para abaixo da timeline).

---

*Wireframe criado para validação antes da implementação.*