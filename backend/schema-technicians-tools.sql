-- ============================================================
-- Technicians, work assignments, tools and tool orders
-- Execute after schema-hostinger.sql and schema-admin-auth.sql
-- ============================================================

-- Technician users (created by admin)
CREATE TABLE IF NOT EXISTS technician_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS technician_users_email_idx ON technician_users(email);

-- Work assignments (which technician is assigned to which work)
CREATE TABLE IF NOT EXISTS work_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES technician_users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(work_id, technician_id)
);

CREATE INDEX IF NOT EXISTS work_assignments_work_id_idx ON work_assignments(work_id);
CREATE INDEX IF NOT EXISTS work_assignments_technician_id_idx ON work_assignments(technician_id);

-- Tools catalog (managed by admin)
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    stock_quantity INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tools_active_idx ON tools(active);

-- Tool orders (technician requests tools)
CREATE TABLE IF NOT EXISTS tool_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID NOT NULL REFERENCES technician_users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tool_orders_technician_id_idx ON tool_orders(technician_id);
CREATE INDEX IF NOT EXISTS tool_orders_status_idx ON tool_orders(status);

-- Tool order items (line items of each order)
CREATE TABLE IF NOT EXISTS tool_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_order_id UUID NOT NULL REFERENCES tool_orders(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tool_order_items_tool_order_id_idx ON tool_order_items(tool_order_id);

-- Trigger for tools updated_at
DROP TRIGGER IF EXISTS update_tools_updated_at ON tools;
CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Trigger for tool_orders updated_at
DROP TRIGGER IF EXISTS update_tool_orders_updated_at ON tool_orders;
CREATE TRIGGER update_tool_orders_updated_at
    BEFORE UPDATE ON tool_orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
