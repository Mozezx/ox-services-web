/**
 * Teste rápido: conexão com o banco e tabelas necessárias (works, timeline_entries, comments).
 * Uso: node test-db.js
 */
require('dotenv').config();
const db = require('./db');

async function run() {
  console.log('🔌 Testando conexão com o banco...');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@') : '(não definido)');

  try {
    // 1) Conexão e tabela works
    const worksCount = await db.query('SELECT COUNT(*) as n FROM works');
    const works = await db.query('SELECT id, name, access_token, status, created_at FROM works ORDER BY created_at DESC LIMIT 3');
    console.log('\n✅ Conexão OK');
    console.log('   Tabela works: %d registro(s)', worksCount.rows[0]?.n ?? 0);
    if (works.rows?.length) {
      works.rows.forEach((w, i) => console.log(`      [${i + 1}] ${w.name} | token: ${w.access_token?.slice(0, 8)}... | ${w.status}`));
    }

    // 2) timeline_entries
    const teCount = await db.query('SELECT COUNT(*) as n FROM timeline_entries');
    console.log('   Tabela timeline_entries: %d registro(s)', teCount.rows[0]?.n ?? 0);

    // 3) comments
    const commentsCount = await db.query('SELECT COUNT(*) as n FROM comments');
    console.log('   Tabela comments: %d registro(s)', commentsCount.rows[0]?.n ?? 0);

    // 4) Se houver obra, testar leitura por token (como a API pública)
    if (works.rows?.length && works.rows[0].access_token) {
      const token = works.rows[0].access_token;
      const work = await db.queryOne('SELECT * FROM works WHERE access_token = $1', [token]);
      if (work) {
        const tl = await db.query('SELECT id, title, type, "order" FROM timeline_entries WHERE work_id = $1 ORDER BY "order"', [work.id]);
        const cm = await db.query('SELECT id, author_name, approved FROM comments WHERE work_id = $1', [work.id]);
        console.log('\n📄 Exemplo de leitura (como /api/works/:token):');
        console.log('   Obra: %s (token %s...)', work.name, token.slice(0, 8));
        console.log('   Timeline: %d entradas | Comentários: %d', tl.rows?.length ?? 0, cm.rows?.length ?? 0);
      }
    } else {
      console.log('\n💡 Dica: crie uma obra no admin para popular o banco; o link da obra usa o access_token da tabela works.');
    }

    console.log('\n✅ Banco pronto: conexão OK e tabelas works, timeline_entries, comments existem.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Erro:', err.message);
    if (err.code) console.error('   Código:', err.code);
    process.exit(1);
  }
}

run();
