# Conectar ao PostgreSQL da Hostinger

## URL de conexão remota

Para acessar o banco da Hostinger **do seu PC** (ou de qualquer máquina fora do servidor), use o host remoto:

```
postgresql://ox_user:SUA_SENHA@85.31.239.235:5432/ox_services
```

Substitua `SUA_SENHA` pela senha do usuário `ox_user`. O host `85.31.239.235` é o servidor PostgreSQL da Hostinger.

**`localhost`** = “esta máquina”.  
- Se o backend roda **no VPS da Hostinger** (no mesmo servidor que o Postgres), use `localhost` em vez de `85.31.239.235`.
- Se o backend roda **no seu PC**, use `85.31.239.235` (conexão remota).

## Acessar o banco da Hostinger “daqui” (do seu PC)

Duas formas usuais:

### 1. Túnel SSH (recomendado)

Você abre um túnel do seu PC para o Postgres no servidor e no `.env` continua usando `localhost:5432`:

1. No seu PC, abra o túnel (substitua `usuario` e `servidor-hostinger` pelos seus):
   - **PowerShell/terminal:**  
     `ssh usuario@servidor-hostinger -L 5432:localhost:5432`
2. Deixe essa janela aberta.
3. No `backend/.env` use (com túnel, localhost encaminha para o servidor):
   ```env
   DATABASE_URL=postgresql://ox_user:SUA_SENHA@localhost:5432/ox_services
   ```
4. Rode o backend no seu PC. Ele vai falar com “localhost:5432”, e o túnel encaminha tudo para o Postgres na Hostinger.

Assim você “acessa o banco que criou na Hostinger” a partir da sua máquina.

### 2. Conexão remota direta

Alguns planos Hostinger permitem conexão direta ao Postgres de fora:

1. No painel da Hostinger (hPanel), veja se existe “Remote PostgreSQL” / “Conexão externa” e qual é o **host** (ex.: `srv123.hostinger.com` ou um IP).
2. Se for preciso, abra um ticket pedindo “acesso remoto ao PostgreSQL” e informe o IP de onde você conecta (seu PC ou seu escritório).
3. No `backend/.env` use o host remoto (ex.: `85.31.239.235`):
   ```env
   DATABASE_URL=postgresql://ox_user:SUA_SENHA@85.31.239.235:5432/ox_services
   ```
   Em muitos casos é necessário SSL. Se der erro de certificado, tente:
   ```env
   DB_SSL=true
   ```
   (o `db.js` já usa SSL quando há `DATABASE_URL`, a menos que `DB_SSL=false`).

## Onde configurar

1. Crie ou edite o arquivo **`backend/.env`** (na pasta do backend).
2. Coloque a URL (para conexão remota do seu PC):
   ```env
   DATABASE_URL=postgresql://ox_user:SUA_SENHA@85.31.239.235:5432/ox_services
   ```
   - Use **85.31.239.235** quando o backend rodar no seu PC e o Postgres estiver na Hostinger.
   - Use **localhost** só se o backend rodar no mesmo servidor que o Postgres (ex.: no VPS Hostinger).
3. Reinicie o backend (`npm start` ou o que você usar).

## Tabelas no banco

O backend espera as tabelas `works`, `timeline_entries` e `comments` (e outras do schema).

1. No painel da Hostinger, abra o **PostgreSQL** (phpPgAdmin, DBeaver, ou o cliente que eles oferecem).
2. Conecte no banco `ox_services` com o usuário `ox_user`.
3. Execute o conteúdo do arquivo **`schema-hostinger.sql`** desse projeto (criação de tabelas e índices).

Se essas tabelas não existirem ou estiverem vazias, a API pode retornar “obra não encontrada” ou listas vazias.

## Resumo

| Onde o backend roda | O que usar no DATABASE_URL |
|---------------------|----------------------------|
| No VPS Hostinger    | `...@localhost:5432/ox_services` (host = servidor) |
| No seu PC com túnel SSH | `...@localhost:5432/ox_services` (túnel encaminha para o VPS) |
| No seu PC, conexão remota | `...@85.31.239.235:5432/ox_services` |

Para acessar o banco da Hostinger do seu PC: use a URL com o host **85.31.239.235** no `backend/.env`.
