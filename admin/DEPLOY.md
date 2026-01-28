# Guia de Deploy - Admin OX Services Obras

## Visão Geral
Sistema administrativo completo para gerenciamento de obras e timeline, com autenticação Clerk, upload de imagens/vídeos e interface PWA.

### Onde fica cada parte (Opção 2)
- **Admin**: `obras.oxservices.org` — painel (login, obras, timeline, upload).
- **Página do cliente** (fotos da obra): `oxservices.org/obra/{token}` — site principal. O link que o admin copia aponta para o site principal.

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

#### Frontend Admin (variáveis no **build** – Vite injeta em tempo de build)

**Modo sem Clerk (recomendado se `failed_to_load_clerk_js_timeout`):**  
O admin pode rodar **sem** Clerk. Nesse modo não há tela de login; o backend aceita o token fixo `test-token`. Use em dev ou quando o Clerk der problema em produção.

```env
VITE_ADMIN_SKIP_CLERK=true
```
Ou deixe `VITE_CLERK_PUBLISHABLE_KEY` **vazio/não definido** – também ativa o modo sem Clerk.

**Modo com Clerk:**  
Para usar login com Clerk, defina a chave **publishable** (não a secret):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...   # ou pk_live_... em produção
```
O build do admin precisa ser feito **com** essas variáveis (ex.: `admin/.env` ou no CI).

**Link da obra (copiar link):**
```env
VITE_PUBLIC_SITE_URL=https://oxservices.org
```
(Em dev, sem essa variável, o link usa localhost.)

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

### 4. Configuração do Nginx (obras.oxservices.org)

**Importante:** o frontend admin chama `/api/admin/...` e `/api/push/...`. O backend expõe `/admin/...` e `/api/push/...`. O Nginx deve remover o prefixo `/api` ao repassar para o backend **apenas** nas rotas que começam com `/api` (rewrite abaixo).

**502 Bad Gateway** = o Nginx não consegue falar com o backend. Confira:
1. Backend rodando: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/api/push/vapid-public-key` (deve retornar 200 ou 404, não erro de conexão).
2. Se usar PM2: `pm2 status` e `pm2 logs`.
3. Porta correta no `proxy_pass` (4000).

```nginx
server {
    server_name obras.oxservices.org;
    
    # Frontend Admin — build:admin gera admin/dist
    root /var/www/ox-services-web/admin/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Manifest e assets — evitar fallback para index.html
    location ~* \.(webmanifest|json|ico|png|svg|woff2)$ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=86400";
    }
    
    # API admin: frontend chama /api/admin/...; backend espera /admin/...
    location /api/admin/ {
        rewrite ^/api(/admin/.*) $1 break;
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API push e outras rotas /api/... (ex.: /api/push/vapid-public-key) — backend já usa /api/...
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Uploads — backend salva em backend/public/uploads
    location /uploads/ {
        alias /var/www/ox-services-web/backend/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Ajuste `root` e `alias` se o projeto estiver em outro caminho (ex.: `/caminho/para/ox-services-web`).

**Checklist rápido (502 / manifest / logo):**
1. Backend rodando: `cd /var/www/ox-services-web/backend && node server.js` ou, com PM2, `cd backend && pm2 start server.js --name ox-backend`.
2. Testar backend: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/api/push/vapid-public-key` → 200.
3. Nginx `root` = `.../admin/dist` (resultado de `npm run build:admin`), **não** a pasta `dist` do site principal.
4. `location /api/admin/` com `rewrite` **antes** de `location /api/`.
5. Recarregar Nginx após editar: `sudo nginx -t && sudo systemctl reload nginx`.

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