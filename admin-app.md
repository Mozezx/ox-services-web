# Admin App - OX Services Obras

## Status
Proposed

## Context
O usuário precisa de um aplicativo de administração para gerenciar obras (tokens) e fazer upload de imagens na timeline de obras. O app deve ser um PWA, hospedado no subdomínio `obras.oxservices.org`, com interface totalmente nova e separada da página de obras do cliente. Utiliza autenticação Clerk e armazenamento de imagens no próprio VPS.

## Stack Tecnológico
- **Frontend**: React 19 + TypeScript + Vite + PWA (vite-plugin-pwa)
- **UI**: CSS Modules / Styled Components (sem Tailwind)
- **Autenticação**: Clerk (@clerk/clerk-react)
- **Backend**: Node.js + Express (existente no diretório `backend/`)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Upload de Imagens**: Multer para upload local no VPS
- **Roteamento**: React Router DOM
- **Estado**: React Query (TanStack) para data fetching

## Arquitetura
### Estrutura de Pastas
```
ox-services-web/
├── admin/                    # Novo frontend de admin
│   ├── components/          # Componentes específicos do admin
│   ├── pages/               # Páginas (Dashboard, Obras, Upload)
│   ├── layouts/             # Layouts (AdminLayout)
│   ├── hooks/               # Hooks customizados
│   └── styles/              # CSS modules
├── backend/                 # Backend existente (será estendido)
│   ├── server.js            # Adicionar endpoints de admin
│   └── middleware/          # Middleware de autenticação Clerk
├── lib/                     # Cliente Supabase compartilhado
└── public/                  # Imagens upload (nova pasta uploads/)
```

### Fluxo de Autenticação
1. Usuário acessa `obras.oxservices.org`
2. Clerk redireciona para login (se não autenticado)
3. Após login, Clerk fornece JWT token
4. Frontend inclui token nas requisições ao backend
5. Backend valida token com Clerk SDK

### Endpoints Backend (Novos)
- `GET /admin/works` – Listar obras (apenas admin)
- `POST /admin/works` – Criar nova obra (gera token)
- `PUT /admin/works/:id` – Atualizar obra
- `DELETE /admin/works/:id` – Remover obra
- `POST /admin/works/:id/upload` – Upload de imagem para timeline
- `GET /admin/works/:id/timeline` – Listar entradas da timeline
- `DELETE /admin/timeline/:entryId` – Remover entrada

### Esquema de Banco de Dados (Supabase)
Tabelas novas:
- `works` (id, name, description, client_name, client_email, start_date, end_date, status, cover_image_url, access_token, created_at, updated_at)
- `timeline_entries` (id, work_id, type, media_url, thumbnail_url, title, description, date, order, created_at)
- `comments` (id, work_id, author_name, author_email, content, approved, created_at) – já existe? Talvez reutilizar.

## Componentes Frontend
- `AdminLayout` – Layout com sidebar e header
- `DashboardPage` – Visão geral de obras e estatísticas
- `WorksPage` – Lista de obras com ações (CRUD)
- `WorkFormPage` – Formulário de criação/edição de obra
- `TimelinePage` – Gerenciamento de timeline de uma obra (upload, remoção, ordenação)
- `UploadModal` – Modal para upload de imagem/vídeo

## PWA Configuration
Extender `vite.config.ts` para suportar múltiplas entry points ou criar configuração separada para admin. Opção: usar o mesmo PWA config, mas ajustar manifest para admin.

## Desafios e Decisões
1. **Upload de imagens no VPS**: Usar Multer para salvar em `public/uploads/` e servir via Express static. Limitar tamanho e tipos.
2. **Geração de token**: Usar `uuidv4` para criar token único por obra.
3. **Segurança**: Clerk proteger rotas frontend e backend. Validar permissões (apenas usuários com role admin).
4. **Subdomínio**: Configurar nginx para proxy reverso para a mesma aplicação React (ou build separado). Pode servir o mesmo build com base no host.

## Próximos Passos
1. Criar esquema de banco no Supabase
2. Estender backend com endpoints protegidos
3. Configurar autenticação Clerk no backend
4. Criar frontend admin com Clerk Provider
5. Implementar páginas de CRUD
6. Implementar upload de imagens
7. Testar integração
8. Configurar PWA e deploy

## Referências
- Clerk Documentation: https://clerk.com/docs
- Vite PWA: https://vite-pwa-org.netlify.app/
- Supabase JavaScript Client: https://supabase.com/docs/reference/javascript