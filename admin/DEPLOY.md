# Guia de Deploy - Admin OX Services Obras

## Visão Geral
Sistema administrativo completo para gerenciamento de obras e timeline, com autenticação Clerk, upload de imagens/vídeos e interface PWA.

## Estrutura do Projeto

### Backend (Node.js + Express)
- **Porta**: 4000
- **Endpoints**:
  - `GET /admin/works` - Listar obras
  - `POST /admin/works` - Criar obra
  - `PUT /admin/works/:id` - Atualizar obra
  - `DELETE /admin/works/:id` - Excluir obra
  - `POST /admin/works/:id/timeline/upload` - Upload de mídia
  - `GET /admin/works/:id/timeline` - Listar timeline
  - `PUT/DELETE /admin/timeline/:id` - Gerenciar entradas

### Frontend Admin (React + TypeScript)
- **Porta**: 3000 (compartilhada com frontend principal)
- **Páginas**:
  - `/admin/index.html` - Página de login/entrada
  - `/dashboard` - Dashboard com estatísticas
  - `/works` - Lista e CRUD de obras
  - `/works/:id` - Detalhes da obra
  - `/works/:id/timeline` - Gerenciamento de timeline
  - `/works/:id/upload` - Upload de mídia

## Configuração de Deploy

### 1. Variáveis de Ambiente

#### Backend (.env)
```env
PORT=4000
CLERK_SECRET_KEY=sk_test_2LapiQkcOJGHVzWw4kS2lmEQnWuDt2xLXfJtHGlhuE
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-servico
```

#### Frontend (.env.local)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_dG9sZXJhbnQtcXVldHphbC0zMi5jbGVyay5hY2NvdW50cy5kZXYk
```

### 2. Banco de Dados (Supabase)
Execute o SQL em `plans/database-schema.md` para criar as tabelas:
- `works` - Obras
- `timeline_entries` - Entradas da timeline

### 3. Deploy no VPS

#### Backend
```bash
cd backend
npm install
npm start
# ou use PM2: pm2 start server.js --name "ox-admin-backend"
```

#### Frontend
```bash
npm run build
# Servir arquivos estáticos da pasta 'dist' no subdomínio obras.oxservices.org
```

### 4. Configuração do Nginx (Exemplo)
```nginx
server {
    server_name obras.oxservices.org;
    
    # Frontend Admin
    location / {
        root /caminho/para/ox-services-web/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API Backend
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Admin API
    location /admin {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Uploads
    location /uploads {
        alias /caminho/para/ox-services-web/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5. Configuração Clerk
1. Acesse https://dashboard.clerk.com
2. Configure as URLs de callback:
   - `https://obras.oxservices.org`
   - `http://localhost:3000` (desenvolvimento)
3. Configure as permissões de usuário/admin conforme necessário

## Funcionalidades Implementadas

### ✅ Backend
- [x] Autenticação Clerk com middleware
- [x] CRUD completo de obras
- [x] Upload de imagens/vídeos (Multer)
- [x] Gerenciamento de timeline
- [x] Mock de dados para desenvolvimento
- [x] CORS configurado

### ✅ Frontend Admin
- [x] Autenticação com Clerk
- [x] Dashboard com estatísticas
- [x] Listagem e CRUD de obras
- [x] Páginas de detalhes da obra
- [x] Upload de mídia com progresso
- [x] Gerenciamento de timeline (editar/excluir/reordenar)
- [x] Interface responsiva
- [x] PWA configurado

### ✅ PWA
- [x] Manifest para admin
- [x] Service Worker (via Vite PWA)
- [x] Instalação como app nativo
- [x] Funcionamento offline básico

## Testes

### Backend
```bash
cd backend
# Testar endpoints
curl -H "Authorization: Bearer test-token" http://localhost:4000/admin/works
```

### Frontend
1. Acesse `http://localhost:3000/admin/index.html`
2. Faça login com Clerk
3. Teste todas as funcionalidades

## Próximos Passos (Opcionais)

1. **Integração com Supabase real** - Remover mocks e conectar ao banco real
2. **Notificações por e-mail** - Enviar notificações para clientes
3. **Relatórios avançados** - Estatísticas detalhadas
4. **Exportação de dados** - Exportar obras em PDF/Excel
5. **API pública** - Endpoints para integração com outros sistemas

## Suporte
- Backend: `backend/server.js`
- Frontend: `admin/`
- Documentação: `plans/`
- Issues: Verificar logs no console e terminal