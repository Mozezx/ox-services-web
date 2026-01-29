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
  - `/login` - Login (e‑mail/senha)
  - `/admin/index.html` - Entrada
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
DATABASE_URL=postgresql://...
JWT_SECRET=seu_segredo_jwt_forte   # ex.: openssl rand -base64 32
```
(opcional: SMTP_*, VAPID_*, CLOUDINARY_* — ver `backend/env-vps-template.txt`)

**Primeiro admin:** execute `backend/schema-admin-auth.sql`, depois:
```bash
cd backend
ADMIN_EMAIL=admin@oxservices.org ADMIN_PASSWORD=sua_senha node seed-admin.js
```

#### Frontend Admin (build)
**Link da obra (copiar link):**
```env
VITE_PUBLIC_SITE_URL=https://oxservices.org
```
(Em dev, sem essa variável, o link usa localhost.)

### 2. Banco de Dados
Execute o SQL em `plans/database-schema.md` e em `backend/schema-admin-auth.sql`:
- `works`, `timeline_entries`, etc. (schema principal)
- `admin_users` (login admin)

### 3. Deploy no VPS

#### Backend
```bash
cd backend
npm install
npm start
```
**Manter rodando com PM2 (evita 502 ao reiniciar o VPS):**
```bash
cd /var/www/ox-services-web/backend
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # opcional: inicia o PM2 no boot
```
Para reiniciar: `pm2 restart ox-backend`. Para logs: `pm2 logs ox-backend`.

#### Frontend
```bash
npm run build
# Servir arquivos estáticos da pasta 'dist' no subdomínio obras.oxservices.org
```

### 4. Nginx — Passo a passo (VPS)

Você tem **dois sites**:
- **Admin**: `obras.oxservices.org` → painel de obras (React em `admin/dist` + API).
- **Site principal**: `oxservices.org` → landing + página do cliente `/obra/:token` (React em `dist` + API).

Execute tudo no VPS como `root` ou com `sudo`.

---

#### 4.1 Arquivos de configuração no projeto

Os configs prontos estão no repositório:
- **Admin**: `admin/obras-nginx.conf`
- **Site principal**: `admin/oxservices-nginx.conf`

No VPS, o Nginx usa:
- `/etc/nginx/sites-available/obras.oxservices.org` → admin
- `/etc/nginx/sites-available/oxservices` → site principal  
(Se o seu arquivo do site principal tiver outro nome, use o que já existe e substitua o conteúdo.)

---

#### 4.2 Admin (obras.oxservices.org)

1. Abrir o arquivo:
   ```bash
   sudo nano /etc/nginx/sites-available/obras.oxservices.org
   ```

2. Colar o conteúdo de `admin/obras-nginx.conf` (ou o bloco abaixo). Ajustar `root` e `alias` se o projeto não estiver em `/var/www/ox-services-web`.

   ```nginx
   # /etc/nginx/sites-available/obras.oxservices.org

   server {
       listen 443 ssl;
       server_name obras.oxservices.org;

       ssl_certificate /etc/letsencrypt/live/obras.oxservices.org/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/obras.oxservices.org/privkey.pem;
       include /etc/letsencrypt/options-ssl-nginx.conf;
       ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

       client_max_body_size 300M;

       root /var/www/ox-services-web/admin/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location ~* \.(webmanifest|json|ico|png|svg|woff2)$ {
           try_files $uri =404;
           add_header Cache-Control "public, max-age=86400";
       }

       location /api/admin/ {
           rewrite ^/api(/admin/.*) $1 break;
           proxy_pass http://127.0.0.1:4000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /api/ {
           proxy_pass http://127.0.0.1:4000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /uploads/ {
           alias /var/www/ox-services-web/backend/public/uploads/;
           expires 30d;
           add_header Cache-Control "public, immutable";
       }
   }

   server {
       if ($host = obras.oxservices.org) {
           return 301 https://$host$request_uri;
       }
       listen 80;
       server_name obras.oxservices.org;
       return 404;
   }
   ```

3. Salvar e sair: `Ctrl+O`, Enter, `Ctrl+X`.

---

#### 4.3 Site principal (oxservices.org)

1. Abrir o arquivo (nome pode variar; no exemplo é `oxservices`):
   ```bash
   sudo nano /etc/nginx/sites-available/oxservices
   ```

2. Colar o conteúdo de `admin/oxservices-nginx.conf` (ou o bloco abaixo). Ajustar caminhos se precisar.

   ```nginx
   # /etc/nginx/sites-available/oxservices — site principal + /obra/:token

   server {
       server_name oxservices.org www.oxservices.org 85.31.239.235;
       root /var/www/ox-services-web/dist;
       index index.html;

       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

       location /api/ {
           proxy_pass http://127.0.0.1:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }

       location ^~ /uploads/ {
           alias /var/www/ox-services-web/backend/public/uploads/;
           expires 30d;
           add_header Cache-Control "public, immutable";
       }

       location ^~ /services/ {
           alias /var/www/ox-services-web/services/;
           try_files $uri $uri.html =404;
       }

       location / {
           try_files $uri $uri/ /index.html;
       }

       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       listen 443 ssl;
       ssl_certificate /etc/letsencrypt/live/oxservices.org-0001/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/oxservices.org-0001/privkey.pem;
       include /etc/letsencrypt/options-ssl-nginx.conf;
       ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
   }

   server {
       if ($host = www.oxservices.org) { return 301 https://$host$request_uri; }
       if ($host = oxservices.org) { return 301 https://$host$request_uri; }
       listen 80;
       server_name oxservices.org www.oxservices.org 85.31.239.235;
       return 404;
   }
   ```

3. **Importante:** Confirme os caminhos do SSL. O exemplo usa `oxservices.org-0001`. No seu servidor pode ser `oxservices.org`. Verifique:
   ```bash
   ls /etc/letsencrypt/live/
   ```
   e ajuste `ssl_certificate` e `ssl_certificate_key` se for diferente.

4. Salvar e sair: `Ctrl+O`, Enter, `Ctrl+X`.

---

#### 4.4 Habilitar os sites (se ainda não estiverem)

```bash
sudo ln -sf /etc/nginx/sites-available/obras.oxservices.org /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/oxservices /etc/nginx/sites-enabled/
```

(Se `oxservices` no seu VPS tiver outro nome em `sites-available`, use esse nome no `ln`.)

---

#### 4.5 Testar e recarregar o Nginx

```bash
sudo nginx -t
```

Se aparecer `syntax is ok` e `test is successful`:

```bash
sudo systemctl reload nginx
```

---

#### 4.6 Checklist rápido

| O quê | Comando / verificação |
|-------|------------------------|
| Backend a correr | `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/api/push/vapid-public-key` → `200` |
| PM2 | `pm2 status` — `ox-backend` (ou o nome que usou) deve estar online |
| Admin build | `root` do admin = `/var/www/ox-services-web/admin/dist` (não a `dist` do site principal) |
| Uploads | `alias` = `/var/www/ox-services-web/backend/public/uploads/` |
| 502 Bad Gateway | Backend parado ou porta errada; confirme que o backend está na porta 4000 |

**502 = Nginx não chega ao backend.** Confira backend, PM2 e `proxy_pass http://127.0.0.1:4000`.

### 5. Autenticação admin
Login com e‑mail/senha (JWT). Usuários em `admin_users`. Criar o primeiro com `seed-admin.js` (ver variáveis de ambiente).

## Funcionalidades Implementadas

### ✅ Backend
- [x] Autenticação Clerk com middleware
- [x] CRUD completo de obras
- [x] Upload de imagens/vídeos (Multer)
- [x] Gerenciamento de timeline
- [x] Mock de dados para desenvolvimento
- [x] CORS configurado

### ✅ Frontend Admin
- [x] Login com e‑mail/senha (JWT)
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
# Login (troque email/senha pelo admin criado)
curl -X POST http://localhost:4000/admin/auth/login -H "Content-Type: application/json" -d '{"email":"admin@oxservices.org","password":"sua_senha"}'
# Usar o token retornado em Authorization: Bearer <token> para /admin/*
```

### Frontend
1. Acesse `http://localhost:3001` (dev admin) ou `https://obras.oxservices.org`
2. Faça login com e‑mail e senha do admin
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