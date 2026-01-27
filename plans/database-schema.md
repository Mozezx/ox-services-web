# Esquema de Banco de Dados - Admin Obras

## Tabelas

### works
Armazena informações das obras (projetos) que os clientes podem acompanhar.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Primary key, gerado automaticamente |
| name | TEXT | Nome da obra (ex: "Reforma Residencial - Casa Silva") |
| description | TEXT | Descrição detalhada da obra |
| client_name | TEXT | Nome do cliente |
| client_email | TEXT | E-mail do cliente |
| start_date | DATE | Data de início prevista |
| end_date | DATE | Data de conclusão prevista |
| status | TEXT | 'planned', 'in_progress', 'completed', 'paused' |
| cover_image_url | TEXT | URL da imagem de capa (opcional) |
| access_token | TEXT | Token único para acesso público à timeline (gerado com uuid) |
| created_at | TIMESTAMPTZ | Data de criação (default now()) |
| updated_at | TIMESTAMPTZ | Data de atualização (auto atualizado) |

Índices:
- `access_token` UNIQUE
- `status`
- `client_email`

### timeline_entries
Cada entrada na timeline (imagem, vídeo, documento) associada a uma obra.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Primary key |
| work_id | UUID | Foreign key para works.id (ON DELETE CASCADE) |
| type | TEXT | 'image', 'video', 'document' |
| media_url | TEXT | Caminho para o arquivo (relativo à pasta uploads) |
| thumbnail_url | TEXT | Caminho para thumbnail (se vídeo) |
| title | TEXT | Título da entrada |
| description | TEXT | Descrição opcional |
| date | DATE | Data da entrada (quando ocorreu) |
| order | INTEGER | Ordem de exibição (ascendente) |
| created_at | TIMESTAMPTZ | Data de criação |

Índices:
- `work_id`
- `date`
- `order`

### comments
Comentários dos clientes na obra (aprovados pelo admin).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Primary key |
| work_id | UUID | Foreign key para works.id |
| author_name | TEXT | Nome do autor |
| author_email | TEXT | E-mail do autor |
| content | TEXT | Texto do comentário |
| approved | BOOLEAN | Se o comentário foi aprovado (default false) |
| created_at | TIMESTAMPTZ | Data de criação |

Índices:
- `work_id`
- `approved`

## Relações
- `works` 1:N `timeline_entries`
- `works` 1:N `comments`

## SQL de Criação (PostgreSQL)
```sql
-- Tabela works
CREATE TABLE works (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    client_email TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'planned',
    cover_image_url TEXT,
    access_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela timeline_entries
CREATE TABLE timeline_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'document')),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT NOT NULL,
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX works_access_token_idx ON works(access_token);
CREATE INDEX works_status_idx ON works(status);
CREATE INDEX timeline_entries_work_id_idx ON timeline_entries(work_id);
CREATE INDEX timeline_entries_date_idx ON timeline_entries(date);
CREATE INDEX comments_work_id_idx ON comments(work_id);
CREATE INDEX comments_approved_idx ON comments(approved);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_works_updated_at BEFORE UPDATE ON works
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();