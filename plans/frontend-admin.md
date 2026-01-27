# Frontend Admin - OX Services Obras

## Estrutura de Pastas
```
admin/
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── works/
│   │   ├── WorksTable.tsx
│   │   ├── WorkForm.tsx
│   │   └── WorkCard.tsx
│   ├── timeline/
│   │   ├── TimelineManager.tsx
│   │   ├── UploadModal.tsx
│   │   └── TimelineEntry.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Dialog.tsx
│       └── Spinner.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── WorksPage.tsx
│   ├── WorkEditPage.tsx
│   ├── TimelinePage.tsx
│   └── SettingsPage.tsx
├── hooks/
│   ├── useWorks.ts
│   ├── useTimeline.ts
│   └── useUpload.ts
├── lib/
│   ├── api.ts           # Cliente HTTP com Clerk token
│   └── utils.ts
├── styles/
│   ├── globals.css
│   ├── layout.css
│   └── components.css
├── App.tsx
├── main.tsx
└── vite.config.ts      (opcional, pode usar o mesmo do projeto raiz)
```

## Stack
- **React 19** com TypeScript
- **Clerk React** para autenticação (`@clerk/clerk-react`)
- **React Router DOM** para roteamento
- **TanStack Query** para data fetching (já instalado)
- **CSS Modules** para estilização (sem Tailwind)
- **Vite** como bundler (mesmo do projeto principal)

## Rotas
```
/                       → redirect to /admin
/admin                  → DashboardPage
/admin/works            → WorksPage (lista de obras)
/admin/works/new        → WorkFormPage (criar)
/admin/works/:id/edit   → WorkFormPage (editar)
/admin/works/:id/timeline → TimelinePage
/admin/settings         → SettingsPage (configurações)
```

Todas as rotas dentro de `/admin` são protegidas por Clerk (`<ClerkProtectedRoute>`).

## Componentes Principais

### AdminLayout
Layout comum com sidebar e header. Sidebar contém navegação para obras, timeline, configurações, etc.

### WorksTable
Tabela com lista de obras, colunas: Nome, Cliente, Status, Token, Ações (editar, excluir, ver timeline). Suporta paginação e filtro por status.

### WorkForm
Formulário para criação/edição de obra. Campos: nome, descrição, cliente, email, datas, status, imagem de capa (upload). Ao salvar, gera token automaticamente (backend).

### TimelineManager
Gerencia as entradas da timeline de uma obra. Exibe lista de entradas com imagem, título, data, ordem. Permite upload de novas imagens/vídeos, reordenar via drag‑and‑drop, excluir.

### UploadModal
Modal para upload de arquivo com preview. Aceita imagem (JPEG, PNG) ou vídeo (MP4). Mostra progresso.

## Autenticação Clerk
Configurar ClerkProvider com as chaves fornecidas:

```tsx
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      {/* rotas */}
    </ClerkProvider>
  );
}
```

Criar componente `ProtectedRoute` que usa `useAuth` do Clerk para redirecionar não autenticados.

## Data Fetching
Usar TanStack Query para caching e invalidação. Exemplo:

```ts
import { useQuery, useMutation } from '@tanstack/react-query';

const useWorks = () => {
  return useQuery({
    queryKey: ['works'],
    queryFn: () => api.get('/admin/works'),
  });
};
```

## Estilização (Frontend‑Design Skill)
### Direção Estética
Escolher um estilo **industrial/utilitário** que combine com o setor de construção civil. Características:
- Cores: tons de concreto (#f5f5f5), azul‑ox (#0B242A), laranja de destaque (#FF6B35)
- Tipografia: **Roboto Mono** para dados e títulos, **Inter** para corpo
- Espaçamento: grid de 8px, bordas arredondadas mínimas
- Efeitos: sombras sutis, bordas com subtle stroke
- Ícones: **Material Symbols** (já instalado)

### Componentes UI
Criar componentes reutilizáveis com CSS Modules, garantindo consistência.

### Responsividade
Layout responsivo: sidebar recolhível em mobile, tabelas scrolláveis horizontalmente.

## Integração com Backend
Cliente HTTP configurado para incluir token Clerk automaticamente:

```ts
import { useAuth } from '@clerk/clerk-react';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken(); // obter token da sessão Clerk
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## PWA Considerations
O admin também deve ser um PWA. Usar a mesma configuração do Vite PWA, mas ajustar `manifest.name` para "OX Services Admin". Incluir ícones específicos.

## Próximos Passos
1. Criar pasta `admin/` com estrutura básica
2. Configurar ClerkProvider no `main.tsx`
3. Criar AdminLayout e rotas básicas
4. Implementar página de Works (lista)
5. Implementar formulário de obra
6. Implementar gerenciamento de timeline
7. Estilizar com CSS Modules
8. Testar integração com backend