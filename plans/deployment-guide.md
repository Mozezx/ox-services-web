# Guia de Deploy - Admin Obras

## Visão Geral
Este guia descreve os passos para implantar o aplicativo de admin OX Services Obras no VPS, no subdomínio `obras.oxservices.org`.

## Pré‑requisitos
- VPS com Ubuntu 22.04 (ou similar)
- Node.js 18+ e npm instalados
- Nginx instalado
- PostgreSQL (ou Supabase, já utilizado)
- Clerk account com aplicação configurada
- Domínio `oxservices.org` apontando para o VPS

## 1. Configurar Banco de Dados (Supabase)
1. Acessar [Supabase Dashboard](https://supabase.com)
2. Criar novo projeto ou usar o existente
3. Executar o SQL de criação de tabelas (ver `plans/database-schema.md`)
4. Anotar URL e Service Role Key

## 2. Configurar Clerk
1. Acessar [Clerk Dashboard](https://dashboard.clerk.com)
2. Criar ou usar aplicação existente
3. Configurar Redirect URLs:
   - `https://obras.oxservices.org/*`
   - `http://localhost:3000/*` (desenvolvimento)
4. Habilitar roles (opcional)
5. Anotar `CLERK_SECRET_KEY` e `CLERK_PUBLISHABLE_KEY`

## 3. Backend

### Clonar Repositório
```bash
cd /var/www
git clone <repo-url> ox-services-admin
cd ox-services-admin
```

### Instalar Dependências
```bash
cd backend
npm install
```

### Configurar Variáveis de Ambiente
Criar `.env` no diretório `backend/`:

```env
PORT=4000
SUPABASE_URL=https://rdfgphlxfwbheluwoyek.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave
CLERK_SECRET_KEY=sk_test_...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
EMAIL_TO=...
```

### Testar Backend Localmente
```bash
npm start
```
Verificar se roda em `http://localhost:4000`.

### Configurar PM2 (Process Manager)
Instalar PM2 globalmente:
```bash
npm install -g pm2
```

Iniciar processo:
```bash
cd backend
pm2 start server.js --name ox-admin-backend
pm2 save
pm2 startup
```

## 4. Frontend

### Build do Frontend
No diretório raiz do projeto (onde está o `vite.config.ts`):

```bash
npm install
npm run build
```

O build será gerado na pasta `dist/`.

### Configurar Nginx para Frontend
Criar arquivo de configuração `/etc/nginx/sites-available/obras.oxservices.org`:

```nginx
server {
    listen 80;
    server_name obras.oxservices.org;
    root /var/www/ox-services-admin/dist;
    index index.html;

    # PWA assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy para backend
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploads static files
    location /uploads/ {
        alias /var/www/ox-services-admin/public/uploads/;
        expires 30d;
    }

    # Fallback para SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Habilitar site:
```bash
sudo ln -s /etc/nginx/sites-available/obras.oxservices.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Configurar SSL (HTTPS)
Usar Certbot com Let's Encrypt:

```bash
sudo certbot --nginx -d obras.oxservices.org
```

## 5. Uploads Directory
Criar pasta de uploads com permissões adequadas:

```bash
sudo mkdir -p /var/www/ox-services-admin/public/uploads
sudo chown -R $USER:$USER /var/www/ox-services-admin/public/uploads
```

## 6. Variáveis de Ambiente Frontend (Build‑time)
Criar `.env.production` na raiz do frontend (ou na pasta `admin/` se o build for só do admin). Use a chave de **teste** do Clerk até o SSL de produção estar ativo:

```env
VITE_API_URL=https://obras.oxservices.org/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_dG9sZXJhbnQtcXVldHphbC0zMi5jbGVyay5hY2NvdW50cy5kZXYk
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

Reconstruir o frontend após alterações.

## 7. Service Worker e PWA
O build do Vite já inclui service worker. Verificar se o Nginx serve `dist/sw.js` e `dist/manifest.webmanifest` corretamente.

## 8. Monitoramento
- **PM2**: `pm2 monit` para ver logs
- **Nginx logs**: `/var/log/nginx/access.log` e `error.log`
- **Backend logs**: `pm2 logs ox-admin-backend`

## 9. Atualizações
### Backend
```bash
cd /var/www/ox-services-admin/backend
git pull
npm install
pm2 restart ox-admin-backend
```

### Frontend
```bash
cd /var/www/ox-services-admin
git pull
npm install
npm run build
# Nginx já serve os arquivos estáticos
```

## 10. Backup
- **Banco de Dados**: Supabase automatic backup (ou configurar dump manual)
- **Uploads**: Fazer backup periódico da pasta `public/uploads/`
- **Código**: Repositório Git

## Troubleshooting
### 502 Bad Gateway
- Verificar se backend está rodando (`pm2 list`)
- Verificar se porta 4000 está aberta

### Upload falha (permissão)
- Verificar permissões da pasta uploads (`chmod 755`)

### Clerk auth não funciona em produção
- Verificar Redirect URLs no Clerk Dashboard
- Verificar se HTTPS está configurado (Clerk requer HTTPS em produção)

### PWA não instala
- Verificar se manifest é acessível via `https://obras.oxservices.org/manifest.webmanifest`
- Verificar se service worker está registrado (DevTools → Application → Service Workers)

## Considerações de Segurança
- Usar variáveis de ambiente, não hardcoded secrets
- Limitar taxa de requisições (rate limiting) no Nginx
- Manter Node.js e dependências atualizadas
- Configurar firewall (ufw) para permitir apenas portas 80, 443, 22

## Conclusão
Seguindo este guia, o aplicativo de admin estará disponível em `https://obras.oxservices.org`, com autenticação Clerk, upload de imagens e gerenciamento completo de obras.