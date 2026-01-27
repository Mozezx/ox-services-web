/**
 * Conexão com PostgreSQL (banco Hostinger ou outro)
 * Use DATABASE_URL ou as variáveis DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (pool) return pool;

  const databaseUrl = process.env.DATABASE_URL;
  const config = databaseUrl
    ? { connectionString: databaseUrl, ssl: process.env.DB_SSL !== 'false' ? { rejectUnauthorized: false } : false }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      };

  if (!config.connectionString && (!config.user || !config.database)) {
    console.warn('⚠️ DB_HOST/DB_USER/DB_PASSWORD/DB_NAME ou DATABASE_URL não definidos – obras usarão dados em memória (mock)');
    return null;
  }

  pool = new Pool(config);
  pool.on('error', (err) => console.error('Erro inesperado no pool do PostgreSQL:', err));
  return pool;
}

/**
 * Executa uma query SQL com parâmetros ($1, $2, ...)
 * @returns { Promise<{ rows: any[], rowCount: number }> }
 */
async function query(text, params = []) {
  const p = getPool();
  if (!p) throw new Error('Banco de dados não configurado');
  const result = await p.query(text, params);
  return result;
}

/**
 * Um único row ou null
 */
async function queryOne(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

module.exports = {
  query,
  queryOne,
  getPool,
};
