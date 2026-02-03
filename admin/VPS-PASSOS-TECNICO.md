# Passos para o VPS – Admin, Técnico e Site

## Onde cada interface é acessada

| Interface | URL | Build (pasta) |
|-----------|-----|----------------|
| **Admin** (obras, agendamentos, técnicos, ferramentas) | **https://obras.oxservices.org** | `admin/dist` |
| **Técnico** (minhas obras, loja, pedidos, upload de fotos) | **https://tecnico.oxservices.org** | `technician/dist` |
| **Site principal** (landing + página da obra para o cliente) | **https://oxservices.org** | `dist` |
| **Backend API** | Usado internamente na porta 4000 (Nginx faz proxy `/api` → `http://127.0.0.1:4000`) | — |

---

## 1. Pré-requisitos no VPS

- Node.js 18+, npm, Nginx, PostgreSQL (ou Supabase)
- Domínio `oxservices.org` com DNS apontando para o VPS
- Subdomínios criados no DNS: `obras.oxservices.org`, `tecnico.oxservices.org` (registro A ou CNAME para o IP do VPS)

---

## 2. Clonar / atualizar o projeto

```bash
cd /var/www
git clone https://github.com/Mozezx/ox-services-web.git
# ou, se já existir:
cd /var/www/ox-services-web
git pull origin main
```

---

## 3. Backend (porta 4000)

```bash
cd /var/www/ox-services-web/backend
npm install
```

Criar `.env` (ver `backend/env-vps-template.txt` ou exemplo no `admin/DEPLOY.md`):

- `PORT=4000`
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=...` (admin)
- Variáveis para técnicos/ferramentas se usar

Executar os SQLs necessários (schema principal, admin, técnicos, ferramentas).

Criar primeiro admin (se ainda não existir):

```bash
cd backend
ADMIN_EMAIL=admin@oxservices.org ADMIN_PASSWORD=sua_senha node seed-admin.js
```

Subir com PM2:

```bash
cd /var/www/ox-services-web/backend
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

---

## 4. Builds dos frontends

Na raiz do projeto:

```bash
cd /var/www/ox-services-web

# Site principal (oxservices.org)
npm install
npm run build

# Admin (obras.oxservices.org)
npm run build:admin

# Técnico (tecnico.oxservices.org)
npm run build:technician
```

Resultado:

- `dist/` → site principal
- `admin/dist/` → admin
- `technician/dist/` → técnico

---

## 5. Nginx – três sites

Arquivos de exemplo no repositório:

- **Admin:** `admin/obras-nginx.conf` → copiar para `/etc/nginx/sites-available/obras.oxservices.org`
- **Site principal:** `admin/oxservices-nginx.conf` → copiar para `/etc/nginx/sites-available/oxservices` (ou o nome que já usar)
- **Técnico:** `admin/tecnico-nginx.conf` → copiar para `/etc/nginx/sites-available/tecnico.oxservices.org`

### 5.1 Admin (obras.oxservices.org)

```bash
sudo cp /var/www/ox-services-web/admin/obras-nginx.conf /etc/nginx/sites-available/obras.oxservices.org
# Ajustar root se o projeto estiver noutro caminho (ex.: root /var/www/ox-services-web/admin/dist;)
```

### 5.2 Técnico (tecnico.oxservices.org)

```bash
sudo cp /var/www/ox-services-web/admin/tecnico-nginx.conf /etc/nginx/sites-available/tecnico.oxservices.org
```

Ajustar no ficheiro:

- `root` para `/var/www/ox-services-web/technician/dist`
- Caminhos do SSL (ver passo 5.4)

### 5.3 Site principal (oxservices.org)

Usar `admin/oxservices-nginx.conf` como referência e ajustar `root` para `/var/www/ox-services-web/dist` e paths de SSL.

### 5.4 Certificado SSL para tecnico.oxservices.org

Se ainda não tiver certificado para o subdomínio do técnico:

```bash
sudo certbot certonly --nginx -d tecnico.oxservices.org
```

Se o Certbot criar um path diferente (ex.: `tecnico.oxservices.org-0001`), ajustar no `tecnico-nginx.conf`:

- `ssl_certificate /etc/letsencrypt/live/tecnico.oxservices.org/fullchain.pem;`
- `ssl_certificate_key /etc/letsencrypt/live/tecnico.oxservices.org/privkey.pem;`

### 5.5 Habilitar os três sites

```bash
sudo ln -sf /etc/nginx/sites-available/obras.oxservices.org /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/tecnico.oxservices.org /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/oxservices /etc/nginx/sites-enabled/
```

### 5.6 Testar e recarregar

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Resumo de acesso

- **Admin:** https://obras.oxservices.org (login admin)
- **Técnico:** https://tecnico.oxservices.org (login técnico – e-mail/senha das contas criadas no admin)
- **Site:** https://oxservices.org (público + página da obra `/obra/:token`)

---

## 7. Atualizar depois de `git pull`

```bash
cd /var/www/ox-services-web
git pull origin main

npm run build
npm run build:admin
npm run build:technician

pm2 restart ox-backend   # ou o nome que tiver no ecosystem.config.cjs
```

Não é preciso alterar Nginx se os caminhos (`root` e `alias`) continuarem iguais.
