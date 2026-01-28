/**
 * Cria o primeiro usuário admin.
 * Uso: ADMIN_EMAIL=admin@oxservices.org ADMIN_PASSWORD=suasenha node seed-admin.js
 * Ou defina no .env e rode: node seed-admin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcrypt');
const db = require('./db');

const email = process.env.ADMIN_EMAIL || process.argv[2];
const password = process.env.ADMIN_PASSWORD || process.argv[3];

if (!email || !password) {
  console.error('Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... node seed-admin.js');
  console.error('Ou: node seed-admin.js admin@exemplo.com senha123');
  process.exit(1);
}

async function run() {
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [email, hash]
    );
    console.log('✅ Admin criado/atualizado:', email);
  } catch (e) {
    console.error('Erro:', e.message);
    process.exit(1);
  } finally {
    const p = db.getPool();
    if (p) p.end();
  }
}

run();
