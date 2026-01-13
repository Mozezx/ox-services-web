# Backend API - OX Services

API Node.js para processar formulários de contato e enviar e-mails via SMTP da Hostinger.

## Estrutura

```
backend/
├── server.js          # Servidor Express principal
├── package.json       # Dependências
├── .env              # Variáveis de ambiente (não commitar)
└── README.md         # Este arquivo
```

## Instalação no VPS

```bash
cd /var/www/ox-services-web
mkdir backend
cd backend
npm init -y
npm install express nodemailer cors dotenv
```

## Configuração

Criar arquivo `.env`:

```env
PORT=4000
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contato@oxservices.be
SMTP_PASS=sua_senha_aqui
EMAIL_TO=contato@oxservices.be
```

## Executar

```bash
node server.js
```

## Manter Rodando (PM2)

```bash
npm install -g pm2
pm2 start server.js --name ox-api
pm2 save
pm2 startup
```

## Nginx Proxy

Adicionar ao arquivo de configuração do Nginx:

```nginx
location /api/ {
    proxy_pass http://localhost:4000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```
