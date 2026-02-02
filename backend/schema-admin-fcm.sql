-- ============================================================
-- Admin FCM tokens for APK push notifications
-- Execute after schema-admin-auth.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_fcm_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL,
    device_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(admin_user_id, device_id)
);

CREATE INDEX IF NOT EXISTS admin_fcm_tokens_admin_user_id_idx ON admin_fcm_tokens(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_fcm_tokens_fcm_token_idx ON admin_fcm_tokens(fcm_token);
