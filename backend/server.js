require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const verifyClerkAuth = require('./middleware/clerkAuth');
const db = require('./db');
const upload = require('./middleware/upload');
const cloudinary = require('./cloudinary');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
// Servir arquivos de upload
app.use('/uploads', express.static('public/uploads'));

// Configurar transporter do Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true para porta 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Verificar conexão SMTP
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Erro na configuração SMTP:', error);
    } else {
        console.log('✅ Servidor SMTP pronto para enviar e-mails');
    }
});

// Dados mockados temporários (substituir por banco de dados)
const works = [
    {
        id: '1',
        name: 'Reforma Residencial - Casa da Família Silva',
        description: 'Reforma completa de cozinha e banheiro com instalação de painéis solares.',
        clientName: 'Família Silva',
        clientEmail: 'silva@email.com',
        startDate: '2024-03-15',
        endDate: '2024-06-30',
        status: 'in_progress',
        coverImageUrl: '/hero-background-new.png',
        accessToken: 'abc123-token-teste',
    }
];

const timelineEntries = [
    {
        id: '1',
        workId: '1',
        type: 'image',
        mediaUrl: '/hero-slide-1.png',
        thumbnailUrl: '/hero-slide-1.png',
        title: 'Demolição da parede antiga',
        description: 'Remoção da parede entre cozinha e sala para criar ambiente integrado.',
        date: '2024-03-20',
        order: 1,
    },
    {
        id: '2',
        workId: '1',
        type: 'video',
        mediaUrl: 'https://example.com/video.mp4',
        thumbnailUrl: '/hero-slide-2.png',
        title: 'Instalação elétrica',
        description: 'Instalação de nova fiação e pontos de energia.',
        date: '2024-04-05',
        order: 2,
    },
    {
        id: '3',
        workId: '1',
        type: 'image',
        mediaUrl: '/hero-slide-3.png',
        thumbnailUrl: '/hero-slide-3.png',
        title: 'Assentamento de piso',
        description: 'Colocação de porcelanato na área da cozinha.',
        date: '2024-04-20',
        order: 3,
    },
];

const comments = [
    {
        id: '1',
        workId: '1',
        authorName: 'João Silva',
        authorEmail: 'joao@email.com',
        content: 'Estou muito satisfeito com o progresso! A equipe é muito profissional.',
        createdAt: '2024-04-10',
        approved: true,
    },
    {
        id: '2',
        workId: '1',
        authorName: 'Maria Oliveira',
        authorEmail: 'maria@email.com',
        content: 'Quando será a instalação dos armários?',
        createdAt: '2024-04-15',
        approved: true,
    },
];

// Rota de teste
app.get('/', (req, res) => {
    res.json({ message: 'OX Services API - Running' });
});

// Rota para enviar e-mail do formulário de contato
app.post('/contact', async (req, res) => {
    const { fullName, company, email, phone, message } = req.body;

    // Validação básica
    if (!fullName || !email || !message) {
        return res.status(400).json({
            error: 'Campos obrigatórios: fullName, email, message'
        });
    }

    // Configurar e-mail
    const mailOptions = {
        from: `"OX Services Website" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO,
        replyTo: email,
        subject: `🆕 Novo Lead - ${fullName}`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0B242A; color: white; padding: 20px; text-align: center; }
          .content { background: #f4f4f4; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #0B242A; }
          .value { margin-top: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Novo Contato Recebido</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">👤 Nome:</div>
              <div class="value">${fullName}</div>
            </div>
            ${company ? `
            <div class="field">
              <div class="label">🏢 Empresa:</div>
              <div class="value">${company}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">📧 E-mail:</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            ${phone ? `
            <div class="field">
              <div class="label">📱 Telefone:</div>
              <div class="value"><a href="tel:${phone}">${phone}</a></div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">💬 Mensagem:</div>
              <div class="value">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="footer">
            <p>Este e-mail foi enviado através do formulário de contato do site OX Services</p>
            <p>Data: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ E-mail enviado para ${process.env.EMAIL_TO}`);
        res.json({ success: true, message: 'E-mail enviado com sucesso!' });
    } catch (error) {
        console.error('❌ Erro ao enviar e-mail:', error);
        res.status(500).json({
            error: 'Erro ao enviar e-mail',
            details: error.message
        });
    }
});

// ========== ENDPOINTS PARA OBRAS (PÚBLICOS) ==========

// GET /api/works/:token - Retorna obra e timeline pelo access_token
app.get('/api/works/:token', async (req, res) => {
    const { token } = req.params;
    
    try {
        const work = await db.queryOne('SELECT * FROM works WHERE access_token = $1', [token]);
        if (!work) {
            return res.status(404).json({ error: 'Obra não encontrada' });
        }
        
        const timelineResult = await db.query(
            'SELECT * FROM timeline_entries WHERE work_id = $1 ORDER BY "order" ASC',
            [work.id]
        );
        const timeline = timelineResult.rows || [];
        
        const commentsResult = await db.query(
            'SELECT * FROM comments WHERE work_id = $1 AND approved = true ORDER BY created_at DESC',
            [work.id]
        );
        const comments = commentsResult.rows || [];
        
        // Transformar dados para o formato esperado pelo frontend
        const workFormatted = {
            id: work.id,
            name: work.name,
            description: work.description,
            clientName: work.client_name,
            clientEmail: work.client_email,
            startDate: work.start_date,
            endDate: work.end_date,
            status: work.status,
            coverImageUrl: work.cover_image_url || '/hero-background-new.png',
            accessToken: work.access_token,
        };
        
        const timelineFormatted = (timeline || []).map(entry => ({
            id: entry.id,
            workId: entry.work_id,
            type: entry.type,
            mediaUrl: entry.media_url,
            thumbnailUrl: entry.thumbnail_url,
            title: entry.title,
            description: entry.description,
            date: entry.date,
            order: entry.order,
        }));
        
        const commentsFormatted = (comments || []).map(comment => ({
            id: comment.id,
            workId: comment.work_id,
            authorName: comment.author_name,
            authorEmail: comment.author_email,
            content: comment.content,
            createdAt: comment.created_at,
            approved: comment.approved,
        }));
        
        res.json({
            work: workFormatted,
            timeline: timelineFormatted,
            comments: commentsFormatted,
        });
    } catch (error) {
        console.error('Erro ao buscar obra:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET /api/works/:token/comments - Lista comentários aprovados
app.get('/api/works/:token/comments', async (req, res) => {
    const { token } = req.params;
    
    try {
        const work = await db.queryOne('SELECT id FROM works WHERE access_token = $1', [token]);
        if (!work) {
            return res.status(404).json({ error: 'Obra não encontrada' });
        }
        
        const commentsResult = await db.query(
            'SELECT * FROM comments WHERE work_id = $1 AND approved = true ORDER BY created_at DESC',
            [work.id]
        );
        const comments = commentsResult.rows || [];
        
        const commentsFormatted = comments.map(comment => ({
            id: comment.id,
            workId: comment.work_id,
            authorName: comment.author_name,
            authorEmail: comment.author_email,
            content: comment.content,
            createdAt: comment.created_at,
            approved: comment.approved,
        }));
        
        res.json(commentsFormatted);
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST /api/works/:token/comments - Adiciona comentário
app.post('/api/works/:token/comments', async (req, res) => {
    const { token } = req.params;
    const { authorName, authorEmail, content } = req.body;
    
    if (!authorName || !content) {
        return res.status(400).json({ error: 'Campos obrigatórios: authorName, content' });
    }
    
    try {
        const work = await db.queryOne('SELECT id, name FROM works WHERE access_token = $1', [token]);
        if (!work) {
            return res.status(404).json({ error: 'Obra não encontrada' });
        }
        
        const insertResult = await db.query(
            `INSERT INTO comments (work_id, author_name, author_email, content, approved)
             VALUES ($1, $2, $3, $4, false)
             RETURNING *`,
            [work.id, authorName, authorEmail || '', content]
        );
        const newComment = insertResult.rows[0];
        
        console.log(`Novo comentário para obra ${work.name}: ${authorName} - ${content.substring(0, 50)}...`);
        
        res.status(201).json({
            success: true,
            message: 'Comentário enviado com sucesso! Será exibido após aprovação.',
            comment: {
                id: newComment.id,
                workId: newComment.work_id,
                authorName: newComment.author_name,
                authorEmail: newComment.author_email,
                content: newComment.content,
                createdAt: newComment.created_at,
                approved: newComment.approved,
            },
        });
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST /api/works/:token/upload - Upload de mídia
app.post('/api/works/:token/upload', async (req, res) => {
    const { token } = req.params;
    const { title, description, type } = req.body;
    
    if (!title || !type) {
        return res.status(400).json({ error: 'Campos obrigatórios: title, type' });
    }
    
    try {
        const work = await db.queryOne('SELECT id, name FROM works WHERE access_token = $1', [token]);
        if (!work) {
            return res.status(404).json({ error: 'Obra não encontrada' });
        }
        
        const insertResult = await db.query(
            `INSERT INTO timeline_entries (work_id, type, media_url, thumbnail_url, title, description, date, "order")
             VALUES ($1, $2, '/placeholder.png', '/placeholder.png', $3, $4, $5, 0)
             RETURNING *`,
            [work.id, type, title, description || '', new Date().toISOString().split('T')[0]]
        );
        const newEntry = insertResult.rows[0];
        
        console.log(`Nova entrada na timeline para obra ${work.name}: ${title} (${type})`);
        
        res.status(201).json({
            success: true,
            message: 'Mídia adicionada com sucesso!',
            entry: {
                id: newEntry.id,
                workId: newEntry.work_id,
                type: newEntry.type,
                mediaUrl: newEntry.media_url,
                thumbnailUrl: newEntry.thumbnail_url,
                title: newEntry.title,
                description: newEntry.description,
                date: newEntry.date,
                order: newEntry.order,
            },
        });
    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ========== ENDPOINTS ADMIN (PROTEGIDOS) ==========
// Aplicar middleware de autenticação Clerk a todas as rotas /admin
app.use('/admin', verifyClerkAuth);

// GET /admin/works - Listar obras
app.get('/admin/works', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM works ORDER BY created_at DESC');
    const data = result.rows || [];
    res.json({ works: data, total: data.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar obras' });
  }
});

// POST /admin/works - Criar obra
app.post('/admin/works', async (req, res) => {
  try {
    const { name, description, client_name, client_email, start_date, end_date, status, cover_image_url } = req.body;
    const access_token = uuidv4();
    const result = await db.query(
      `INSERT INTO works (name, description, client_name, client_email, start_date, end_date, status, cover_image_url, access_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, description || null, client_name || null, client_email || null, start_date || null, end_date || null, status || 'planned', cover_image_url || null, access_token]
    );
    const data = result.rows[0];
    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar obra' });
  }
});

// GET /admin/works/:id - Obter obra por ID
app.get('/admin/works/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.queryOne('SELECT * FROM works WHERE id = $1', [id]);
    if (!data) return res.status(404).json({ error: 'Obra não encontrada' });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar obra' });
  }
});

// PUT /admin/works/:id - Atualizar obra
app.put('/admin/works/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const allowed = ['name', 'description', 'client_name', 'client_email', 'start_date', 'end_date', 'status', 'cover_image_url'];
    const setClause = [];
    const values = [];
    let i = 1;
    for (const key of allowed) {
      if (key in updates) {
        setClause.push(`${key} = $${i}`);
        values.push(updates[key]);
        i++;
      }
    }
    if (setClause.length === 0) return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
    values.push(id);
    const result = await db.query(
      `UPDATE works SET ${setClause.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    const data = result.rows[0];
    if (!data) return res.status(404).json({ error: 'Obra não encontrada' });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar obra' });
  }
});

// DELETE /admin/works/:id - Excluir obra
app.delete('/admin/works/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM works WHERE id = $1', [id]);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir obra' });
  }
});

// Multer: usar memory quando Cloudinary está configurado (upload via buffer)
const timelineUploadMw = cloudinary.isConfigured()
  ? upload.uploadMemory.single('file')
  : upload.single('file');

// POST /admin/works/:id/timeline/upload - Upload de imagem/vídeo (Cloudinary ou disco local)
app.post('/admin/works/:id/timeline/upload', timelineUploadMw, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const detectedType = file.mimetype.startsWith('image') ? 'image' : 'video';
    let mediaUrl;
    let thumbnailUrl = null;

    if (cloudinary.isConfigured()) {
      // Enviar para o Cloudinary (req.file.buffer vem do multer memoryStorage)
      const resourceType = detectedType === 'image' ? 'image' : 'video';
      if (!file.buffer) {
        return res.status(400).json({ error: 'Arquivo não disponível para upload' });
      }
      const result = await cloudinary.uploadBuffer(file.buffer, {
        folder: `ox-services/obras/${id}`,
        resourceType,
      });
      mediaUrl = result.secure_url;
      thumbnailUrl = result.thumbnail_url || null;
    } else {
      // Fallback: disco local (req.file tem path e filename quando multer disk)
      mediaUrl = `/uploads/works/${id}/${file.filename}`;
      if (detectedType === 'video') {
        thumbnailUrl = `/uploads/works/${id}/thumb_${file.filename}.jpg`;
      }
    }

    const insertResult = await db.query(
      `INSERT INTO timeline_entries (work_id, type, media_url, thumbnail_url, title, description, date, "order")
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
       RETURNING *`,
      [id, detectedType, mediaUrl, thumbnailUrl, title || '', description || '', date || new Date().toISOString().split('T')[0]]
    );
    const data = insertResult.rows[0];

    res.status(201).json({ entry: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
});

// GET /admin/works/:id/timeline - Listar timeline de uma obra
app.get('/admin/works/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM timeline_entries WHERE work_id = $1 ORDER BY "order" ASC',
      [id]
    );
    res.json({ entries: result.rows || [] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar timeline' });
  }
});

// DELETE /admin/timeline/:entryId - Excluir entrada
app.delete('/admin/timeline/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    await db.query('DELETE FROM timeline_entries WHERE id = $1', [entryId]);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir entrada' });
  }
});

// PUT /admin/timeline/:entryId - Atualizar entrada
app.put('/admin/timeline/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const updates = req.body;
    const allowed = ['title', 'description', 'date', 'order', 'media_url', 'thumbnail_url', 'type'];
    const setClause = [];
    const values = [];
    let i = 1;
    for (const key of allowed) {
      if (key in updates) {
        const col = key === 'order' ? '"order"' : key;
        setClause.push(`${col} = $${i}`);
        values.push(updates[key]);
        i++;
      }
    }
    if (setClause.length === 0) return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
    values.push(entryId);
    const result = await db.query(
      `UPDATE timeline_entries SET ${setClause.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    const data = result.rows[0];
    if (!data) return res.status(404).json({ error: 'Entrada não encontrada' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar entrada' });
  }
});

// PUT /admin/works/:id/timeline/reorder - Reordenar entradas
app.put('/admin/works/:id/timeline/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body; // array de IDs
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ error: 'order deve ser um array de IDs' });
    }
    for (let index = 0; index < order.length; index++) {
      await db.query(
        'UPDATE timeline_entries SET "order" = $1 WHERE id = $2 AND work_id = $3',
        [index + 1, order[index], id]
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao reordenar' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📁 Endpoints de obras disponíveis:`);
    console.log(`   GET  /api/works/:token`);
    console.log(`   GET  /api/works/:token/comments`);
    console.log(`   POST /api/works/:token/comments`);
    console.log(`   POST /api/works/:token/upload`);
    console.log(`📁 Endpoints admin disponíveis:`);
    console.log(`   GET  /admin/works`);
    console.log(`   POST /admin/works`);
    console.log(`   GET  /admin/works/:id`);
    console.log(`   PUT  /admin/works/:id`);
    console.log(`   DELETE /admin/works/:id`);
});
