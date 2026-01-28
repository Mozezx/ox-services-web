require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const webpush = require('web-push');
const verifyClerkAuth = require('./middleware/clerkAuth');
const db = require('./db');
const upload = require('./middleware/upload');
const cloudinary = require('./cloudinary');

const app = express();
const PORT = process.env.PORT || 4000;

// Log se o banco está configurado (carrega .env da pasta backend)
if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL definida – backend vai usar o PostgreSQL configurado');
} else {
  console.warn('⚠️ DATABASE_URL não definida – defina em backend/.env (ver HOSTINGER-DB.md)');
}

// ========== CONFIGURAÇÃO WEB PUSH ==========
// Configurar VAPID keys para push notifications (falha silenciosa se inválidas)
let vapidConfigured = false;
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
        webpush.setVapidDetails(
            process.env.VAPID_EMAIL || 'mailto:admin@oxservices.org',
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
        vapidConfigured = true;
        console.log('✅ Web Push configurado com VAPID keys');
    } catch (e) {
        console.warn('⚠️ VAPID keys inválidas - Push notifications desativadas:', e.message);
        console.warn('   Remova VAPID_* do .env ou gere novas chaves: npx web-push generate-vapid-keys');
    }
}
if (!vapidConfigured) {
    if (!process.env.VAPID_PUBLIC_KEY && !process.env.VAPID_PRIVATE_KEY) {
        console.warn('⚠️ VAPID keys não configuradas - Push notifications desativadas');
        console.warn('   Gere as chaves com: npx web-push generate-vapid-keys');
    }
}

// Função para enviar push notification para todos os subscribers
async function sendPushNotificationToAll(title, body, data = {}) {
    if (!vapidConfigured) {
        return;
    }

    try {
        const result = await db.query('SELECT * FROM push_subscriptions');
        const subscriptions = result.rows || [];

        console.log(`📤 Enviando push para ${subscriptions.length} dispositivo(s)...`);

        const payload = JSON.stringify({
            title,
            body,
            icon: '/logo.png',
            badge: '/logo.png',
            data: {
                url: '/appointments',
                ...data
            }
        });

        const sendPromises = subscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.keys_p256dh,
                    auth: sub.keys_auth
                }
            };

            try {
                await webpush.sendNotification(pushSubscription, payload);
                console.log(`✅ Push enviado para: ${sub.endpoint.substring(0, 50)}...`);
            } catch (error) {
                console.error(`❌ Erro ao enviar push para ${sub.endpoint.substring(0, 50)}:`, error.message);
                // Se a subscription expirou ou é inválida, remover do banco
                if (error.statusCode === 404 || error.statusCode === 410) {
                    await db.query('DELETE FROM push_subscriptions WHERE id = $1', [sub.id]);
                    console.log(`🗑️ Subscription removida (expirada): ${sub.id}`);
                }
            }
        });

        await Promise.allSettled(sendPromises);
    } catch (error) {
        console.error('Erro ao buscar subscriptions:', error);
    }
}

// Middleware
app.use(cors());
app.use(express.json());
// Servir arquivos de upload
app.use('/uploads', express.static('public/uploads'));

// SMTP opcional – só configura e verifica se variáveis estiverem definidas
let transporter = null;
const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER);
if (smtpConfigured) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    transporter.verify((err) => {
        if (err) {
            console.warn('⚠️ SMTP não disponível – e-mails desativados:', err.message);
        } else {
            console.log('✅ Servidor SMTP pronto para enviar e-mails');
        }
    });
} else {
    console.warn('⚠️ SMTP não configurado (SMTP_HOST, SMTP_USER) – e-mails desativados');
}

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

    if (!fullName || !email || !message) {
        return res.status(400).json({
            error: 'Campos obrigatórios: fullName, email, message'
        });
    }
    if (!transporter) {
        return res.status(503).json({
            error: 'Envio de e-mail temporariamente indisponível'
        });
    }

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

// ========== ENDPOINT PARA AGENDAMENTOS (PÚBLICO) ==========

// POST /api/appointments - Criar agendamento (substitui envio de email)
app.post('/api/appointments', async (req, res) => {
    const { fullName, company, email, phone, message } = req.body;

    // Validação básica
    if (!fullName || !email) {
        return res.status(400).json({
            error: 'Campos obrigatórios: fullName, email'
        });
    }

    try {
        // Salvar no banco de dados
        const insertResult = await db.query(
            `INSERT INTO appointments (full_name, company, email, phone, message, status)
             VALUES ($1, $2, $3, $4, $5, 'new')
             RETURNING *`,
            [fullName, company || null, email, phone || null, message || null]
        );
        const appointment = insertResult.rows[0];

        console.log(`📅 Novo agendamento: ${fullName} (${email})`);

        // Enviar push notification para admin
        await sendPushNotificationToAll(
            '🆕 Novo Agendamento!',
            `${fullName} enviou uma mensagem`,
            { appointmentId: appointment.id }
        );

        res.status(201).json({
            success: true,
            message: 'Agendamento enviado com sucesso!',
            appointment: {
                id: appointment.id,
                fullName: appointment.full_name,
                company: appointment.company,
                email: appointment.email,
                phone: appointment.phone,
                message: appointment.message,
                status: appointment.status,
                createdAt: appointment.created_at,
            }
        });
    } catch (error) {
        console.error('❌ Erro ao criar agendamento:', error);
        res.status(500).json({
            error: 'Erro ao criar agendamento',
            details: error.message
        });
    }
});

// GET /api/push/vapid-public-key - Obter chave pública VAPID (público)
app.get('/api/push/vapid-public-key', (req, res) => {
    if (!vapidConfigured || !process.env.VAPID_PUBLIC_KEY) {
        return res.status(404).json({ error: 'VAPID key não configurada' });
    }
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// ========== ENDPOINTS PARA OBRAS (PÚBLICOS) ==========

// Funções auxiliares para cálculo de estatísticas
function calculateProgress(startDate, endDate, status) {
    if (status === 'completed') return 100;
    if (status === 'planned') return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const totalDuration = end - start;
    const elapsed = now - start;
    
    return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
}

function getDaysSince(date) {
    const start = new Date(date);
    const now = new Date();
    const diffTime = now - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

function getDaysUntil(date) {
    const end = new Date(date);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

function getTotalDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

// GET /api/works/:token - Retorna obra e timeline pelo access_token
app.get('/api/works/:token', async (req, res) => {
    const { token } = req.params;
    
    try {
        const work = await db.queryOne('SELECT * FROM works WHERE access_token = $1', [token]);
        if (!work) {
            return res.status(404).json({ error: 'Obra não encontrada' });
        }
        
        const timelineResult = await db.query(
            'SELECT * FROM timeline_entries WHERE work_id = $1 ORDER BY date DESC, created_at DESC',
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
        
        // Calcular estatísticas da obra
        const photosCount = timelineFormatted.filter(t => t.type === 'image').length;
        const videosCount = timelineFormatted.filter(t => t.type === 'video').length;
        const notesCount = timelineFormatted.filter(t => t.type === 'note').length;
        
        // Ordenar por data para pegar a última atualização
        const sortedByDate = [...timelineFormatted].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        const stats = {
            progress: calculateProgress(work.start_date, work.end_date, work.status),
            daysWorked: getDaysSince(work.start_date),
            daysRemaining: getDaysUntil(work.end_date),
            totalDays: getTotalDays(work.start_date, work.end_date),
            photosCount,
            videosCount,
            notesCount,
            totalEntries: timelineFormatted.length,
            commentsCount: commentsFormatted.length,
            lastUpdate: sortedByDate[0]?.date || work.start_date,
        };
        
        res.json({
            work: workFormatted,
            timeline: timelineFormatted,
            comments: commentsFormatted,
            stats,
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

// Multer middleware para upload de imagem de capa
const coverUploadMw = cloudinary.isConfigured()
  ? upload.uploadMemory.single('cover')
  : upload.single('cover');

// POST /admin/upload/cover - Upload de imagem de capa para Cloudinary
app.post('/admin/upload/cover', coverUploadMw, async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Verificar se é uma imagem
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({ error: 'Apenas imagens são permitidas para capa' });
    }

    let imageUrl;

    if (cloudinary.isConfigured()) {
      // Enviar para o Cloudinary
      if (!file.buffer) {
        return res.status(400).json({ error: 'Arquivo não disponível para upload' });
      }
      const result = await cloudinary.uploadBuffer(file.buffer, {
        folder: 'ox-services/covers',
        resourceType: 'image',
      });
      imageUrl = result.secure_url;
    } else {
      // Fallback: disco local
      const fs = require('fs');
      const path = require('path');
      const coversDir = path.join(__dirname, 'public', 'uploads', 'covers');
      if (!fs.existsSync(coversDir)) {
        fs.mkdirSync(coversDir, { recursive: true });
      }
      const filename = `${Date.now()}_${file.originalname}`;
      const filepath = path.join(coversDir, filename);
      fs.writeFileSync(filepath, file.buffer);
      imageUrl = `/uploads/covers/${filename}`;
    }

    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Erro no upload de capa:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem de capa' });
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
      'SELECT * FROM timeline_entries WHERE work_id = $1 ORDER BY date DESC, created_at DESC',
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

// ========== ENDPOINTS ADMIN - AGENDAMENTOS ==========

// GET /admin/appointments - Listar agendamentos
app.get('/admin/appointments', async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT * FROM appointments';
        const params = [];

        if (status && status !== 'all') {
            query += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.query(query, params);
        const appointments = result.rows || [];

        // Formatar dados para o frontend
        const formatted = appointments.map(apt => ({
            id: apt.id,
            fullName: apt.full_name,
            company: apt.company,
            email: apt.email,
            phone: apt.phone,
            message: apt.message,
            status: apt.status,
            createdAt: apt.created_at,
            updatedAt: apt.updated_at,
        }));

        res.json({ appointments: formatted, total: formatted.length });
    } catch (error) {
        if (error.code === '42P01' || (error.message && error.message.includes('appointments'))) {
            return res.json({ appointments: [], total: 0 });
        }
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
});

function emptyAppointmentStats() {
  return { total: 0, new: 0, read: 0, contacted: 0, completed: 0 };
}

// GET /admin/appointments/stats - Estatísticas de agendamentos
app.get('/admin/appointments/stats', async (req, res) => {
    try {
        const totalResult = await db.query('SELECT COUNT(*) as count FROM appointments');
        const newResult = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'new'");
        const readResult = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'read'");
        const contactedResult = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'contacted'");
        const completedResult = await db.query("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'");

        res.json({
            total: parseInt(totalResult.rows[0].count),
            new: parseInt(newResult.rows[0].count),
            read: parseInt(readResult.rows[0].count),
            contacted: parseInt(contactedResult.rows[0].count),
            completed: parseInt(completedResult.rows[0].count),
        });
    } catch (error) {
        // Tabela appointments pode não existir se só works/timeline/comments foram criados
        if (error.code === '42P01' || (error.message && error.message.includes('appointments'))) {
            return res.json(emptyAppointmentStats());
        }
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

// GET /admin/appointments/:id - Obter agendamento por ID
app.get('/admin/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const apt = await db.queryOne('SELECT * FROM appointments WHERE id = $1', [id]);

        if (!apt) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        res.json({
            id: apt.id,
            fullName: apt.full_name,
            company: apt.company,
            email: apt.email,
            phone: apt.phone,
            message: apt.message,
            status: apt.status,
            createdAt: apt.created_at,
            updatedAt: apt.updated_at,
        });
    } catch (error) {
        console.error('Erro ao buscar agendamento:', error);
        res.status(500).json({ error: 'Erro ao buscar agendamento' });
    }
});

// PUT /admin/appointments/:id - Atualizar agendamento (status)
app.put('/admin/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['new', 'read', 'contacted', 'completed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        const result = await db.query(
            'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agendamento não encontrado' });
        }

        const apt = result.rows[0];
        res.json({
            id: apt.id,
            fullName: apt.full_name,
            company: apt.company,
            email: apt.email,
            phone: apt.phone,
            message: apt.message,
            status: apt.status,
            createdAt: apt.created_at,
            updatedAt: apt.updated_at,
        });
    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        res.status(500).json({ error: 'Erro ao atualizar agendamento' });
    }
});

// DELETE /admin/appointments/:id - Excluir agendamento
app.delete('/admin/appointments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM appointments WHERE id = $1', [id]);
        res.status(204).end();
    } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
        res.status(500).json({ error: 'Erro ao excluir agendamento' });
    }
});

// ========== ENDPOINTS ADMIN - PUSH SUBSCRIPTIONS ==========

// POST /admin/push/subscribe - Registrar subscription
app.post('/admin/push/subscribe', async (req, res) => {
    try {
        const { endpoint, keys } = req.body;

        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            return res.status(400).json({ error: 'Dados de subscription inválidos' });
        }

        // Upsert: inserir ou atualizar se já existir
        const existingResult = await db.query(
            'SELECT id FROM push_subscriptions WHERE endpoint = $1',
            [endpoint]
        );

        if (existingResult.rows.length > 0) {
            // Atualizar chaves
            await db.query(
                'UPDATE push_subscriptions SET keys_p256dh = $1, keys_auth = $2 WHERE endpoint = $3',
                [keys.p256dh, keys.auth, endpoint]
            );
            console.log('🔄 Push subscription atualizada');
        } else {
            // Inserir nova
            await db.query(
                `INSERT INTO push_subscriptions (endpoint, keys_p256dh, keys_auth)
                 VALUES ($1, $2, $3)`,
                [endpoint, keys.p256dh, keys.auth]
            );
            console.log('✅ Nova push subscription registrada');
        }

        res.json({ success: true, message: 'Subscription registrada com sucesso' });
    } catch (error) {
        console.error('Erro ao registrar subscription:', error);
        res.status(500).json({ error: 'Erro ao registrar subscription' });
    }
});

// DELETE /admin/push/unsubscribe - Remover subscription
app.delete('/admin/push/unsubscribe', async (req, res) => {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({ error: 'Endpoint obrigatório' });
        }

        await db.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
        console.log('🗑️ Push subscription removida');

        res.json({ success: true, message: 'Subscription removida com sucesso' });
    } catch (error) {
        console.error('Erro ao remover subscription:', error);
        res.status(500).json({ error: 'Erro ao remover subscription' });
    }
});

// POST /admin/push/test - Testar push notification (desenvolvimento)
app.post('/admin/push/test', async (req, res) => {
    try {
        await sendPushNotificationToAll(
            '🔔 Teste de Notificação',
            'Esta é uma notificação de teste do Admin OX Services',
            { test: true }
        );
        res.json({ success: true, message: 'Notificação de teste enviada' });
    } catch (error) {
        console.error('Erro ao enviar notificação de teste:', error);
        res.status(500).json({ error: 'Erro ao enviar notificação' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📁 Endpoints públicos disponíveis:`);
    console.log(`   POST /api/appointments`);
    console.log(`   GET  /api/push/vapid-public-key`);
    console.log(`   GET  /api/works/:token`);
    console.log(`   GET  /api/works/:token/comments`);
    console.log(`   POST /api/works/:token/comments`);
    console.log(`   POST /api/works/:token/upload`);
    console.log(`📁 Endpoints admin - Obras:`);
    console.log(`   GET  /admin/works`);
    console.log(`   POST /admin/works`);
    console.log(`   GET  /admin/works/:id`);
    console.log(`   PUT  /admin/works/:id`);
    console.log(`   DELETE /admin/works/:id`);
    console.log(`📁 Endpoints admin - Agendamentos:`);
    console.log(`   GET  /admin/appointments`);
    console.log(`   GET  /admin/appointments/stats`);
    console.log(`   GET  /admin/appointments/:id`);
    console.log(`   PUT  /admin/appointments/:id`);
    console.log(`   DELETE /admin/appointments/:id`);
    console.log(`📁 Endpoints admin - Push:`);
    console.log(`   POST /admin/push/subscribe`);
    console.log(`   DELETE /admin/push/unsubscribe`);
    console.log(`   POST /admin/push/test`);
});
