-- ============================================================
-- Admin: autenticação própria (sem Clerk)
-- Execute após o schema principal (schema-hostinger.sql)
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users(email);

-- Primeiro admin: criar manualmente com seed-admin.js
-- npm run seed:admin (ou node seed-admin.js)
