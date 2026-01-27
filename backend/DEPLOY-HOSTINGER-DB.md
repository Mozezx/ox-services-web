# Deploy com banco PostgreSQL na Hostinger

O backend usa **PostgreSQL** diretamente (não Supabase). O banco pode estar na Hostinger (VPS, Cloud ou BD remoto).

## 1. Criar o schema no banco

No painel da Hostinger, crie um banco **PostgreSQL** e um usuário com permissão total. Depois execute o SQL:

**Opção A – phpPgAdmin / HeidiSQL / DBeaver**  
Abra o arquivo `schema-hostinger.sql` e execute todo o conteúdo no banco criado.

**Opção B – Linha de comando**

```bash
psql -h SEU_HOST -U SEU_USUARIO -d SEU_BANCO -f schema-hostinger.sql
```

Isso cria as tabelas `works`, `timeline_entries` e `comments`.

## 2. Variáveis de ambiente

No VPS, no diretório `backend/`, crie ou edite o `.env`:

### Opção 1 – URL de conexão (recomendado)

```env
PORT=4000
DATABASE_URL=postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO

# Clerk (admin)
CLERK_SECRET_KEY=sk_...

# E-mail (formulário de contato)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=contato@oxservices.be
SMTP_PASS=sua_senha
EMAIL_TO=contato@oxservices.be

# Cloudinary (upload de imagens/vídeos da timeline) – opcional; ver backend/CLOUDINARY.md
# CLOUDINARY_CLOUD_NAME=xxx
# CLOUDINARY_API_KEY=xxx
# CLOUDINARY_API_SECRET=xxx
```

### Opção 2 – Variáveis separadas

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nome_do_banco

# Se o banco exigir SSL (ex.: BD remoto Hostinger):
# DB_SSL=true

CLERK_SECRET_KEY=sk_...
SMTP_HOST=...
SMTP_PORT=465
SMTP_USER=...
SMTP_PASS=...
EMAIL_TO=...
```

### Onde pegar os dados na Hostinger

- **VPS**: PostgreSQL costuma rodar em `localhost:5432`. Crie banco e usuário via SSH ou painel.
- **Banco remoto (hPanel)**: Em “Bancos de dados” → PostgreSQL, use o host, usuário, senha e nome do banco que o painel mostrar.
- **SSL**: Se a Hostinger exigir SSL para o banco, use `DB_SSL=true` ou `DATABASE_URL=...?sslmode=require`.

## 3. Instalar dependências e rodar

```bash
cd backend
npm install
node server.js
```

Ou com PM2:

```bash
pm2 start server.js --name ox-admin-backend
pm2 save
pm2 startup
```

## 4. Testar a conexão

Se o banco estiver ok, ao subir o servidor **não** deve aparecer o aviso  
“DB_HOST/DB_USER/DB_PASSWORD/DB_NAME ou DATABASE_URL não definidos”.

Teste um endpoint (com token do Clerk no header):

```bash
curl -H "Authorization: Bearer SEU_TOKEN_CLERK" https://obras.oxservices.org/admin/works
```

Deve retornar `{"works":[],"total":0}` ou a lista de obras.

## Banco MySQL na Hostinger

Este projeto está preparado para **PostgreSQL**. Se você criou um banco **MySQL** na Hostinger, o schema e o código precisam ser adaptados (outro driver, outro SQL). Avise se for o caso e eu indico os passos.
