-- ============================================================
-- Devoluções de ferramentas (admin marca como devolvido)
-- Execute after schema-technicians-tools.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS tool_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID NOT NULL REFERENCES technician_users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    returned_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tool_returns_technician_id_idx ON tool_returns(technician_id);
CREATE INDEX IF NOT EXISTS tool_returns_tool_id_idx ON tool_returns(tool_id);
