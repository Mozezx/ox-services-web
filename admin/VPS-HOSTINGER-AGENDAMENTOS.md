# O que fazer no VPS Hostinger – Agendamentos e Push

Checklist para ativar a tela de agendamentos e notificações push no admin.

---

## 1. Conectar no VPS e atualizar o código

```bash
cd /caminho/do/seu/projeto/ox-services-web   # ou onde o projeto está no VPS
git pull   # se usar git
```

Se não usa git, copie os arquivos atualizados (backend, admin, components/ContactForm, etc.) para o servidor.

---

## 2. Banco de dados – novas tabelas

No PostgreSQL do VPS (phpPgAdmin, DBeaver, `psql`, etc.), execute este SQL:

```sql
-- Tabela appointments (agendamentos/leads)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'contacted', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela push_subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT UNIQUE NOT NULL,
    keys_p256dh TEXT NOT NULL,
    keys_auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);
CREATE INDEX IF NOT EXISTS appointments_created_at_idx ON appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS appointments_email_idx ON appointments(email);

-- Usa a função update_updated_at_column que já existe no schema
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
```

Se a função `update_updated_at_column` ainda não existir, crie antes (está em `backend/schema-hostinger.sql`).

---

## 3. Chaves VAPID (push notifications)

No VPS, na pasta do backend:

```bash
cd backend
npm install
npx web-push generate-vapid-keys
```

Você verá algo como:

```
Public Key:  BEl62iUYgUivxIkv69yViEuiBIa...
Private Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxx...
```

Guarde as duas chaves.

---

## 4. Variáveis de ambiente do backend

Edite o `.env` do backend no VPS e adicione:

```env
VAPID_PUBLIC_KEY=cole_a_chave_publica_aqui
VAPID_PRIVATE_KEY=cole_a_chave_privada_aqui
VAPID_EMAIL=mailto:admin@oxservices.org
```

Não compartilhe a chave privada. Mantenha o `.env` fora do git.

---

## 5. Reiniciar o backend

Se usar PM2:

```bash
cd backend
pm2 restart ox-admin-backend
# ou o nome que você deu ao processo
pm2 save
```

Se usar outro gerenciador ou script, reinicie o processo Node do backend para carregar o novo `.env` e o código atualizado.

---

## 6. Nginx – servir o service worker do admin

O `sw-push.js` precisa ser acessível na mesma origem do admin (HTTPS).

Exemplo de `location` para o admin (ajuste paths e domínios ao seu caso):

```nginx
# Exemplo: admin em https://admin.oxservices.org (ou /admin no mesmo domínio)
location / {
    root /var/www/ox-services-web/admin/dist;   # build do admin
    try_files $uri $uri/ /index.html;
}

# Garantir que /sw-push.js seja servido (evitar ser tratado como SPA)
location = /sw-push.js {
    root /var/www/ox-services-web/admin/dist;
    add_header Service-Worker-Allowed /;
    add_header Cache-Control "no-cache";
}
```

Se o admin estiver em um subpath (ex.: `/admin/`), o service worker costuma ser registrado com `scope: '/'` ou com o path do admin; nesse caso, o `root` e o `location` devem refletir esse path. O importante é que **HTTPS** esteja ativo nesse host e que `/sw-push.js` responda com status 200.

---

## 7. Site principal – URL da API

O formulário de contato chama a API em:

`VITE_API_URL` ou, se não existir, `https://oxservices.org/api`.

No build do **site principal** (não do admin), defina:

```env
VITE_API_URL=https://seu-dominio-api.com/api
```

Substitua `seu-dominio-api.com` pelo domínio onde o backend está (ex.: `api.oxservices.org` ou o mesmo domínio com `location /api`). Faça o build de novo após alterar o `.env`.

---

## 8. Admin – build e deploy

Na sua máquina ou no VPS:

```bash
cd admin
npm install
npm run build
```

Copie o conteúdo de `admin/dist/` para o diretório que o Nginx usa como `root` do admin (no exemplo acima, `/var/www/ox-services-web/admin/dist`).

Certifique-se de que o build inclui `sw-push.js`. Se o Vite não colocar `admin/public/sw-push.js` em `dist/`, copie manualmente:

```bash
cp admin/public/sw-push.js admin/dist/
```

(no servidor ou no passo de deploy).

---

## 9. Testar no celular

1. Abra o admin em **HTTPS** no celular (ex.: `https://admin.oxservices.org`).
2. Faça login (e-mail/senha).
3. Quando o navegador pedir permissão para notificações, aceite.
4. Deixe o admin em segundo plano ou feche o app.
5. No site principal, envie um agendamento pelo formulário de contato.
6. Deve chegar uma notificação push no celular e, ao tocar, abrir a tela de agendamentos.

---

## Resumo rápido

| Onde | O que fazer |
|------|-------------|
| **PostgreSQL** | Rodar o SQL das tabelas `appointments` e `push_subscriptions` |
| **Backend** | `npm install`, gerar VAPID, colocar no `.env`, reiniciar |
| **Nginx** | Garantir HTTPS no admin e que `/sw-push.js` seja servido |
| **Site** | Build com `VITE_API_URL` apontando para a API |
| **Admin** | Build e copiar `dist/` (+ `sw-push.js` se precisar) para o servidor |

Push notification só funciona em **HTTPS** e em contextos seguros (localhost ou sites com certificado válido).
