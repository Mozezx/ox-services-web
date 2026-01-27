-- ============================================================
-- Schema OX Services Obras - PostgreSQL (Hostinger)
-- Execute este arquivo no seu banco PostgreSQL (phpPgAdmin, DBeaver, ou linha de comando)
-- ============================================================

-- Tabela works (obras)
CREATE TABLE IF NOT EXISTS works (
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

-- Tabela timeline_entries (fotos/vídeos da timeline)
CREATE TABLE IF NOT EXISTS timeline_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'document')),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title TEXT NOT NULL,
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela comments (comentários dos clientes)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS works_access_token_idx ON works(access_token);
CREATE INDEX IF NOT EXISTS works_status_idx ON works(status);
CREATE INDEX IF NOT EXISTS timeline_entries_work_id_idx ON timeline_entries(work_id);
CREATE INDEX IF NOT EXISTS timeline_entries_date_idx ON timeline_entries(date);
CREATE INDEX IF NOT EXISTS comments_work_id_idx ON comments(work_id);
CREATE INDEX IF NOT EXISTS comments_approved_idx ON comments(approved);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_works_updated_at ON works;
CREATE TRIGGER update_works_updated_at
    BEFORE UPDATE ON works
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- Tabelas para Agendamentos e Push Notifications
-- ============================================================

-- Tabela appointments (agendamentos/leads do formulário de contato)
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

-- Tabela push_subscriptions (subscriptions para notificações push)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT UNIQUE NOT NULL,
    keys_p256dh TEXT NOT NULL,
    keys_auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para appointments
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);
CREATE INDEX IF NOT EXISTS appointments_created_at_idx ON appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS appointments_email_idx ON appointments(email);

-- Trigger para atualizar updated_at em appointments
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
