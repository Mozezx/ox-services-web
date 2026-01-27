/**
 * Cria uma obra fictícia no banco (works + 2 entradas de timeline).
 * Uso: node seed-obra-ficticia.js
 */
require('dotenv').config();
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const OBRA = {
  name: 'Reforma cobertura Rua das Flores',
  description: 'Impermeabilização EPDM e instalação de claraboias na cobertura do edifício. Inclui isolamento térmico e acabamento perimetral.',
  client_name: 'Maria Santos',
  client_email: 'maria.santos@email.com',
  start_date: '2025-01-15',
  end_date: '2025-03-30',
  status: 'in_progress',
  cover_image_url: null,
};

async function run() {
  const access_token = uuidv4();
  console.log('📌 Criando obra fictícia...');

  try {
    const insertWork = await db.query(
      `INSERT INTO works (name, description, client_name, client_email, start_date, end_date, status, cover_image_url, access_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, access_token`,
      [OBRA.name, OBRA.description, OBRA.client_name, OBRA.client_email, OBRA.start_date, OBRA.end_date, OBRA.status, OBRA.cover_image_url, access_token]
    );
    const work = insertWork.rows[0];
    if (!work) throw new Error('Falha ao inserir obra');

    // Timeline: 2 entradas fictícias (imagens placeholder)
    const baseUrl = 'https://res.cloudinary.com/demo/image/upload';
    await db.query(
      `INSERT INTO timeline_entries (work_id, type, media_url, thumbnail_url, title, description, date, "order")
       VALUES ($1, 'image', $2, $2, $3, $4, $5, 0)`,
      [work.id, `${baseUrl}/sample.jpg`, 'Demolição e preparo do substrato', 'Remoção de telhas antigas e nivelamento da laje.', OBRA.start_date]
    );
    await db.query(
      `INSERT INTO timeline_entries (work_id, type, media_url, thumbnail_url, title, description, date, "order")
       VALUES ($1, 'image', $2, $2, $3, $4, $5, 1)`,
      [work.id, `${baseUrl}/sample.jpg`, 'Aplicação da manta EPDM', 'Primeira etapa da impermeabilização concluída.', '2025-02-01']
    );

    console.log('✅ Obra criada:', work.name);
    console.log('   Token:', work.access_token);
    console.log('   Link (site principal):', `http://localhost:3000/obra/${work.access_token}`);
    console.log('   Timeline: 2 entradas inseridas.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

run();
