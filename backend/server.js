require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const webpush = require('web-push');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verifyJwt = require('./middleware/jwtAuth');
const verifyTechnicianJwt = require('./middleware/technicianAuth');
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

// Base URL do admin (para ícone da notificação push em URL absoluta — necessário no mobile)
const ADMIN_APP_URL = (process.env.ADMIN_APP_URL || 'https://obras.oxservices.org').replace(/\/$/, '');

// Função para enviar push notification para todos os subscribers
async function sendPushNotificationToAll(title, body, data = {}) {
    if (!vapidConfigured) {
        return;
    }

    try {
        const result = await db.query('SELECT * FROM push_subscriptions');
        const subscriptions = result.rows || [];

        console.log(`📤 Enviando push para ${subscriptions.length} dispositivo(s)...`);

        const iconUrl = `${ADMIN_APP_URL}/notification-icon.png`;
        const payload = JSON.stringify({
            title,
            body,
            icon: iconUrl,
            badge: iconUrl,
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

    // Also send to admin FCM tokens (APK)
    await sendFcmToAdmins(title, body, data);
}

// Send FCM notifications to admin devices (for APK)
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;
async function sendFcmToAdmins(title, body, data = {}) {
    if (!FCM_SERVER_KEY) return;
    try {
        const result = await db.query('SELECT fcm_token FROM admin_fcm_tokens');
        const tokens = (result.rows || []).map((r) => r.fcm_token).filter(Boolean);
        if (tokens.length === 0) return;
        const url = 'https://fcm.googleapis.com/fcm/send';
        for (const token of tokens) {
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `key=${FCM_SERVER_KEY}`,
                    },
                    body: JSON.stringify({
                        to: token,
                        notification: { title, body },
                        data: { url: data.url || '/appointments', ...data },
                    }),
                });
                if (!res.ok) {
                    const text = await res.text();
                    if (res.status === 401 || (text && (text.includes('InvalidRegistration') || text.includes('NotRegistered')))) {
                        await db.query('DELETE FROM admin_fcm_tokens WHERE fcm_token = $1', [token]);
                    }
                }
            } catch (e) {
                console.error('FCM send error:', e.message);
            }
        }
    } catch (error) {
        console.error('Erro ao enviar FCM:', error);
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

// GET vapid-public-key - Obter chave pública VAPID (público)
// Rota sem /api para quando o proxy do admin reescreve /api -> '' (ex.: /push/vapid-public-key)
function handleVapidPublicKey(req, res) {
    if (!vapidConfigured || !process.env.VAPID_PUBLIC_KEY) {
        return res.status(200).json({ publicKey: null });
    }
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
}
app.get('/api/push/vapid-public-key', handleVapidPublicKey);
app.get('/push/vapid-public-key', handleVapidPublicKey);

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

/** Dias trabalhados: do início até hoje OU até o fim da obra, se já terminou. */
function getDaysWorked(startDate, endDate) {
    const start = new Date(startDate);
    const now = new Date();
    if (now < start) return 0;
    if (!endDate) return getDaysSince(startDate);
    const end = new Date(endDate);
    if (now >= end) return getTotalDays(startDate, endDate);
    return getDaysSince(startDate);
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
            daysWorked: getDaysWorked(work.start_date, work.end_date),
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
// Login (rota pública dentro de /admin; middleware ignora /auth/login)
app.post('/admin/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha obrigatórios' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET não configurado' });
  }
  try {
    const user = await db.queryOne(
      'SELECT id, email, password_hash FROM admin_users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.use('/admin', verifyJwt);
app.use('/api/admin', verifyJwt);

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

// ========== ENDPOINTS ADMIN - TÉCNICOS ==========
// GET /admin/technicians/inventory - Inventário: ferramentas que cada técnico possui (pedidos aprovados menos devoluções)
app.get('/admin/technicians/inventory', async (req, res) => {
  try {
    const allTechs = await db.query('SELECT id, full_name FROM technician_users ORDER BY full_name, id');
    const techList = allTechs.rows || [];
    const result = await db.query(`
      WITH order_qty AS (
        SELECT o.technician_id, toi.tool_id, SUM(toi.quantity)::INTEGER AS qty
        FROM tool_orders o
        JOIN tool_order_items toi ON toi.tool_order_id = o.id
        WHERE o.status = 'approved'
        GROUP BY o.technician_id, toi.tool_id
      ),
      return_qty AS (
        SELECT technician_id, tool_id, SUM(quantity)::INTEGER AS qty
        FROM tool_returns
        GROUP BY technician_id, tool_id
      )
      SELECT u.id AS technician_id, u.full_name AS technician_name, t.id AS tool_id, t.name AS tool_name,
             GREATEST(0, oq.qty - COALESCE(rq.qty, 0))::INTEGER AS quantity
      FROM order_qty oq
      JOIN technician_users u ON u.id = oq.technician_id
      JOIN tools t ON t.id = oq.tool_id
      LEFT JOIN return_qty rq ON rq.technician_id = oq.technician_id AND rq.tool_id = oq.tool_id
      WHERE (oq.qty - COALESCE(rq.qty, 0)) > 0
      ORDER BY u.full_name, t.name
    `);
    const rows = result.rows || [];
    const byTechnician = new Map();
    for (const row of rows) {
      const id = row.technician_id;
      if (!byTechnician.has(id)) {
        byTechnician.set(id, { technician_id: id, technician_name: row.technician_name, tools: [], total_items: 0 });
      }
      const entry = byTechnician.get(id);
      entry.tools.push({ tool_id: row.tool_id, tool_name: row.tool_name, quantity: row.quantity });
      entry.total_items += row.quantity;
    }
    const technicians = techList.map((u) => ({
      technician_id: u.id,
      technician_name: u.full_name || 'Sem nome',
      tools: byTechnician.get(u.id)?.tools || [],
      total_items: byTechnician.get(u.id)?.total_items ?? 0,
    }));
    res.json({ technicians });
  } catch (error) {
    if (error.code === '42P01') return res.json({ technicians: [] });
    console.error('GET /admin/technicians/inventory:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar inventário' });
  }
});

// POST /admin/tool-returns - Marcar ferramenta(s) como devolvida(s) pelo técnico
app.post('/admin/tool-returns', async (req, res) => {
  try {
    const { technician_id, tool_id, quantity, notes } = req.body;
    if (!technician_id || !tool_id || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'technician_id, tool_id e quantity (>= 1) são obrigatórios' });
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ error: 'quantity deve ser um número positivo' });
    }
    const orderQty = await db.queryOne(
      `SELECT COALESCE(SUM(toi.quantity), 0)::INTEGER AS qty
       FROM tool_orders o
       JOIN tool_order_items toi ON toi.tool_order_id = o.id
       WHERE o.technician_id = $1 AND toi.tool_id = $2 AND o.status = 'approved'`,
      [technician_id, tool_id]
    );
    const returnedQty = await db.queryOne(
      `SELECT COALESCE(SUM(quantity), 0)::INTEGER AS qty FROM tool_returns WHERE technician_id = $1 AND tool_id = $2`,
      [technician_id, tool_id]
    );
    const available = (orderQty?.qty ?? 0) - (returnedQty?.qty ?? 0);
    if (qty > available) {
      return res.status(400).json({ error: `O técnico possui apenas ${available} unidade(s) desta ferramenta. Não é possível devolver ${qty}.` });
    }
    await db.query(
      `INSERT INTO tool_returns (technician_id, tool_id, quantity, notes) VALUES ($1, $2, $3, $4)`,
      [technician_id, tool_id, qty, notes || null]
    );
    res.status(201).json({ ok: true, message: 'Devolução registada.' });
  } catch (error) {
    if (error.code === '42P01') return res.status(503).json({ error: 'Tabela tool_returns não existe. Execute schema-tool-returns.sql.' });
    console.error('POST /admin/tool-returns:', error);
    res.status(500).json({ error: error.message || 'Erro ao registar devolução' });
  }
});

// POST /admin/tool-returns/bulk - Devolver todas as ferramentas de um técnico de uma vez
app.post('/admin/tool-returns/bulk', async (req, res) => {
  try {
    const { technician_id, notes } = req.body;
    if (!technician_id) {
      return res.status(400).json({ error: 'technician_id é obrigatório' });
    }
    const rows = await db.query(
      `WITH order_qty AS (
        SELECT o.technician_id, toi.tool_id, SUM(toi.quantity)::INTEGER AS qty
        FROM tool_orders o
        JOIN tool_order_items toi ON toi.tool_order_id = o.id
        WHERE o.technician_id = $1 AND o.status = 'approved'
        GROUP BY o.technician_id, toi.tool_id
      ),
      return_qty AS (
        SELECT technician_id, tool_id, SUM(quantity)::INTEGER AS qty
        FROM tool_returns
        WHERE technician_id = $1
        GROUP BY technician_id, tool_id
      )
      SELECT oq.tool_id, GREATEST(0, oq.qty - COALESCE(rq.qty, 0))::INTEGER AS quantity
      FROM order_qty oq
      LEFT JOIN return_qty rq ON rq.technician_id = oq.technician_id AND rq.tool_id = oq.tool_id
      WHERE (oq.qty - COALESCE(rq.qty, 0)) > 0`,
      [technician_id]
    );
    const items = rows.rows || [];
    if (items.length === 0) {
      return res.status(400).json({ error: 'O técnico não possui ferramentas para devolver.' });
    }
    for (const row of items) {
      await db.query(
        `INSERT INTO tool_returns (technician_id, tool_id, quantity, notes) VALUES ($1, $2, $3, $4)`,
        [technician_id, row.tool_id, row.quantity, notes || null]
      );
    }
    res.status(201).json({ ok: true, message: `${items.length} ferramenta(s) devolvida(s).` });
  } catch (error) {
    if (error.code === '42P01') return res.status(503).json({ error: 'Tabela tool_returns não existe. Execute schema-tool-returns.sql.' });
    console.error('POST /admin/tool-returns/bulk:', error);
    res.status(500).json({ error: error.message || 'Erro ao registar devoluções' });
  }
});

// GET /admin/technicians - Listar técnicos
app.get('/admin/technicians', async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, full_name, created_at FROM technician_users ORDER BY full_name, email');
    const data = result.rows || [];
    res.json({ technicians: data, total: data.length });
  } catch (error) {
    if (error.code === '42P01') return res.json({ technicians: [], total: 0 });
    console.error('GET /admin/technicians:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar técnicos' });
  }
});

// POST /admin/technicians - Criar técnico
app.post('/admin/technicians', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha obrigatórios' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO technician_users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, created_at`,
      [email.trim().toLowerCase(), password_hash, full_name || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Email já cadastrado' });
    if (error.code === '42P01') return res.status(503).json({ error: 'Tabela technician_users não existe. Execute schema-technicians-tools.sql na base de dados.' });
    console.error('POST /admin/technicians:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar técnico' });
  }
});

// GET /admin/technicians/:id - Obter técnico
app.get('/admin/technicians/:id', async (req, res) => {
  try {
    const data = await db.queryOne(
      'SELECT id, email, full_name, created_at FROM technician_users WHERE id = $1',
      [req.params.id]
    );
    if (!data) return res.status(404).json({ error: 'Técnico não encontrado' });
    res.json(data);
  } catch (error) {
    if (error.code === '42P01') return res.status(503).json({ error: 'Tabela technician_users não existe. Execute schema-technicians-tools.sql.' });
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar técnico' });
  }
});

// PUT /admin/technicians/:id - Atualizar técnico
app.put('/admin/technicians/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, password } = req.body;
    const updates = [];
    const values = [];
    let i = 1;
    if (email !== undefined) {
      updates.push(`email = $${i}`);
      values.push(email.trim().toLowerCase());
      i++;
    }
    if (full_name !== undefined) {
      updates.push(`full_name = $${i}`);
      values.push(full_name);
      i++;
    }
    if (password !== undefined && password !== '') {
      updates.push(`password_hash = $${i}`);
      values.push(await bcrypt.hash(password, 10));
      i++;
    }
    if (updates.length === 0) return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
    values.push(id);
    const result = await db.query(
      `UPDATE technician_users SET ${updates.join(', ')} WHERE id = $${i} RETURNING id, email, full_name, created_at`,
      values
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Técnico não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Email já cadastrado' });
    if (error.code === '42P01') return res.status(503).json({ error: 'Tabela technician_users não existe. Execute schema-technicians-tools.sql.' });
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar técnico' });
  }
});

// DELETE /admin/technicians/:id - Remover técnico
app.delete('/admin/technicians/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM technician_users WHERE id = $1', [id]);
    res.status(204).end();
  } catch (error) {
    if (error.code === '42P01') return res.status(503).json({ error: 'Tabela technician_users não existe. Execute schema-technicians-tools.sql.' });
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir técnico' });
  }
});

// GET /admin/technicians/:id/assignments - Listar obras atribuídas a um técnico
app.get('/admin/technicians/:id/assignments', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT wa.work_id, w.name AS work_name
       FROM work_assignments wa
       JOIN works w ON w.id = wa.work_id
       WHERE wa.technician_id = $1
       ORDER BY wa.assigned_at DESC`,
      [id]
    );
    const data = result.rows || [];
    res.json({ assignments: data, total: data.length });
  } catch (error) {
    if (error.code === '42P01') return res.json({ assignments: [], total: 0 });
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar obras do técnico' });
  }
});

// ========== ENDPOINTS ADMIN - ATRIBUIÇÃO DE OBRAS ==========
// GET /admin/works/:id/assignments - Listar técnicos atribuídos à obra
app.get('/admin/works/:id/assignments', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT wa.id, wa.work_id, wa.technician_id, wa.assigned_at,
              t.email, t.full_name
       FROM work_assignments wa
       JOIN technician_users t ON t.id = wa.technician_id
       WHERE wa.work_id = $1
       ORDER BY wa.assigned_at DESC`,
      [id]
    );
    const data = result.rows || [];
    res.json({ assignments: data, total: data.length });
  } catch (error) {
    if (error.code === '42P01') return res.json({ assignments: [], total: 0 });
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar atribuições' });
  }
});

// POST /admin/works/:id/assignments - Atribuir técnico
app.post('/admin/works/:id/assignments', async (req, res) => {
  try {
    const { id } = req.params;
    const { technician_id } = req.body;
    if (!technician_id) return res.status(400).json({ error: 'technician_id obrigatório' });
    await db.query(
      `INSERT INTO work_assignments (work_id, technician_id)
       VALUES ($1, $2)
       ON CONFLICT (work_id, technician_id) DO NOTHING
       RETURNING *`,
      [id, technician_id]
    );
    const assignment = await db.queryOne(
      `SELECT wa.*, t.email, t.full_name FROM work_assignments wa
       JOIN technician_users t ON t.id = wa.technician_id
       WHERE wa.work_id = $1 AND wa.technician_id = $2`,
      [id, technician_id]
    );
    res.status(201).json(assignment || { work_id: id, technician_id });
  } catch (error) {
    if (error.code === '23503') return res.status(400).json({ error: 'Obra ou técnico não encontrado' });
    console.error(error);
    res.status(500).json({ error: 'Erro ao atribuir técnico' });
  }
});

// DELETE /admin/works/:id/assignments/:technicianId - Remover atribuição
app.delete('/admin/works/:id/assignments/:technicianId', async (req, res) => {
  try {
    const { id, technicianId } = req.params;
    await db.query('DELETE FROM work_assignments WHERE work_id = $1 AND technician_id = $2', [id, technicianId]);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover atribuição' });
  }
});

// ========== ENDPOINTS ADMIN - FERRAMENTAS (LOJA) ==========
// GET /admin/tools - Listar ferramentas
app.get('/admin/tools', async (req, res) => {
  try {
    const { active } = req.query;
    let query = 'SELECT * FROM tools';
    const params = [];
    if (active !== undefined && active !== '') {
      query += ' WHERE active = $1';
      params.push(active === 'true');
    }
    query += ' ORDER BY name';
    const result = await db.query(query, params);
    const data = result.rows || [];
    res.json({ tools: data, total: data.length });
  } catch (error) {
    if (error.code === '42P01') return res.json({ tools: [], total: 0 });
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar ferramentas' });
  }
});

// POST /admin/tools - Criar ferramenta
app.post('/admin/tools', async (req, res) => {
  try {
    const { name, description, image_url, stock_quantity, active } = req.body;
    if (!name) return res.status(400).json({ error: 'name obrigatório' });
    const result = await db.query(
      `INSERT INTO tools (name, description, image_url, stock_quantity, active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, image_url || null, stock_quantity != null ? stock_quantity : null, active !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar ferramenta' });
  }
});

// GET /admin/tools/:id - Obter ferramenta
app.get('/admin/tools/:id', async (req, res) => {
  try {
    const data = await db.queryOne('SELECT * FROM tools WHERE id = $1', [req.params.id]);
    if (!data) return res.status(404).json({ error: 'Ferramenta não encontrada' });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar ferramenta' });
  }
});

// PUT /admin/tools/:id - Atualizar ferramenta
app.put('/admin/tools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const allowed = ['name', 'description', 'image_url', 'stock_quantity', 'active'];
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
      `UPDATE tools SET ${setClause.join(', ')} WHERE id = $${i} RETURNING *`,
      values
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Ferramenta não encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar ferramenta' });
  }
});

// DELETE /admin/tools/:id - Remover ferramenta
app.delete('/admin/tools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM tools WHERE id = $1', [id]);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir ferramenta' });
  }
});

// ========== ENDPOINTS ADMIN - PEDIDOS DE FERRAMENTAS ==========
// GET /admin/tool-orders - Listar pedidos
app.get('/admin/tool-orders', async (req, res) => {
  try {
    const { status, technician_id } = req.query;
    let query = `
      SELECT o.*, t.full_name as technician_name, t.email as technician_email
      FROM tool_orders o
      JOIN technician_users t ON t.id = o.technician_id
      WHERE 1=1`;
    const params = [];
    let i = 1;
    if (status && status !== 'all') {
      query += ` AND o.status = $${i}`;
      params.push(status);
      i++;
    }
    if (technician_id) {
      query += ` AND o.technician_id = $${i}`;
      params.push(technician_id);
      i++;
    }
    query += ' ORDER BY o.created_at DESC';
    const result = await db.query(query, params);
    const orders = result.rows || [];
    res.json({ orders, total: orders.length });
  } catch (error) {
    if (error.code === '42P01') return res.json({ orders: [], total: 0 });
    console.error('GET /admin/tool-orders:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar pedidos' });
  }
});

// GET /admin/tool-orders/:id - Detalhe do pedido
app.get('/admin/tool-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db.queryOne(
      `SELECT o.*, t.full_name as technician_name, t.email as technician_email
       FROM tool_orders o
       JOIN technician_users t ON t.id = o.technician_id
       WHERE o.id = $1`,
      [id]
    );
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    const itemsResult = await db.query(
      `SELECT toi.*, t.name as tool_name, t.description as tool_description
       FROM tool_order_items toi
       JOIN tools t ON t.id = toi.tool_id
       WHERE toi.tool_order_id = $1`,
      [id]
    );
    const items = itemsResult.rows || [];
    res.json({
      order: {
        id: order.id,
        technician_id: order.technician_id,
        technician_name: order.technician_name,
        technician_email: order.technician_email,
        status: order.status,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      items: items.map(i => ({
        id: i.id,
        tool_id: i.tool_id,
        tool_name: i.tool_name,
        tool_description: i.tool_description,
        quantity: i.quantity,
      })),
    });
  } catch (error) {
    if (error.code === '42P01') return res.status(503).json({ error: 'Tabelas tool_orders/tool_order_items não existem. Execute schema-technicians-tools.sql.' });
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

// PUT /admin/tool-orders/:id - Atualizar status (approved, rejected)
app.put('/admin/tool-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const valid = ['pending', 'approved', 'rejected'];
    if (!status || !valid.includes(status)) {
      return res.status(400).json({ error: 'Status inválido (pending, approved, rejected)' });
    }
    const result = await db.query(
      'UPDATE tool_orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '42P01') return res.status(503).json({ error: 'Tabela tool_orders não existe. Execute schema-technicians-tools.sql.' });
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
});

// Multer: capa sempre em memory (Cloudinary usa buffer; local escreve buffer em uploads/covers)
const coverUploadMw = upload.uploadMemory.single('cover');

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;   // 20 MB
const MAX_VIDEO_BYTES = 300 * 1024 * 1024;  // 300 MB

// POST /admin/upload/cover - Upload de imagem de capa para Cloudinary
app.post('/admin/upload/cover', coverUploadMw, async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({ error: 'Apenas imagens são permitidas para capa' });
    }

    const size = file.size ?? file.buffer?.length ?? 0;
    if (size > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: 'Imagem de capa: máximo 20 MB' });
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
      // Fallback: disco local (file.buffer existe porque usamos uploadMemory)
      const path = require('path');
      const fs = require('fs');
      const coversDir = path.join(__dirname, 'public', 'uploads', 'covers');
      if (!fs.existsSync(coversDir)) {
        fs.mkdirSync(coversDir, { recursive: true });
      }
      const base = path.basename(file.originalname || 'cover').replace(/\s/g, '_');
      const ext = path.extname(base) || '.jpg';
      const name = path.basename(base, ext) || 'cover';
      const filename = `${Date.now()}_${name}${ext}`;
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

// POST /admin/upload/tool-image (e /api/admin/upload/tool-image) - Upload de foto de ferramenta
const toolImageUploadMw = upload.uploadMemory.single('image');
async function handleToolImageUpload(req, res) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({ error: 'Apenas imagens são permitidas' });
    }
    const size = file.size ?? file.buffer?.length ?? 0;
    if (size > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: 'Imagem: máximo 20 MB' });
    }
    let imageUrl;
    if (cloudinary.isConfigured()) {
      if (!file.buffer) {
        return res.status(400).json({ error: 'Arquivo não disponível para upload' });
      }
      const result = await cloudinary.uploadBuffer(file.buffer, {
        folder: 'ox-services/tools',
        resourceType: 'image',
      });
      imageUrl = result.secure_url;
    } else {
      const path = require('path');
      const fs = require('fs');
      const toolsDir = path.join(__dirname, 'public', 'uploads', 'tools');
      if (!fs.existsSync(toolsDir)) {
        fs.mkdirSync(toolsDir, { recursive: true });
      }
      const base = path.basename(file.originalname || 'tool').replace(/\s/g, '_');
      const ext = path.extname(base) || '.jpg';
      const name = path.basename(base, ext) || 'tool';
      const filename = `${Date.now()}_${name}${ext}`;
      const filepath = path.join(toolsDir, filename);
      fs.writeFileSync(filepath, file.buffer);
      imageUrl = `/uploads/tools/${filename}`;
    }
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Erro no upload de foto da ferramenta:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da foto' });
  }
}
app.post('/admin/upload/tool-image', toolImageUploadMw, handleToolImageUpload);
app.post('/api/admin/upload/tool-image', toolImageUploadMw, handleToolImageUpload);

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
    const size = file.size ?? file.buffer?.length ?? 0;
    if (detectedType === 'image' && size > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: 'Imagem: máximo 20 MB' });
    }
    if (detectedType === 'video' && size > MAX_VIDEO_BYTES) {
      return res.status(413).json({ error: 'Vídeo: máximo 300 MB' });
    }

    let mediaUrl;
    let thumbnailUrl = null;

    if (cloudinary.isConfigured()) {
      // Enviar para o Cloudinary (req.file.buffer vem do multer memoryStorage)
      const resourceType = detectedType === 'image' ? 'image' : 'video';
      if (!file.buffer) {
        return res.status(400).json({ error: 'Arquivo não disponível para upload' });
      }
      const result = await cloudinary.uploadBuffer(file.buffer, {
        folder: `ox-uploads/obras/${id}`,
        resourceType,
      });
      mediaUrl = result.secure_url;
      thumbnailUrl = result.thumbnail_url || null;
    } else {
      // Fallback: disco local (req.file tem path e filename quando multer disk)
      mediaUrl = `/uploads/works/${id}/${file.filename}`;
      if (detectedType === 'image') {
        thumbnailUrl = mediaUrl;
      } else if (detectedType === 'video') {
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

// POST /admin/push/fcm-register - Registrar token FCM (para APK admin)
app.post('/admin/push/fcm-register', async (req, res) => {
    try {
        const adminUserId = req.user?.id;
        if (!adminUserId) return res.status(401).json({ error: 'Não autenticado' });
        const { fcm_token, device_id } = req.body || {};
        if (!fcm_token) return res.status(400).json({ error: 'fcm_token obrigatório' });
        const deviceId = device_id || null;
        await db.query(
            'DELETE FROM admin_fcm_tokens WHERE admin_user_id = $1 AND (device_id IS NOT DISTINCT FROM $2)',
            [adminUserId, deviceId]
        );
        await db.query(
            'INSERT INTO admin_fcm_tokens (admin_user_id, fcm_token, device_id) VALUES ($1, $2, $3)',
            [adminUserId, fcm_token, deviceId]
        );
        res.json({ success: true, message: 'Token FCM registrado' });
    } catch (error) {
        if (error.code === '42P01') return res.status(400).json({ error: 'Tabela admin_fcm_tokens não existe. Execute schema-admin-fcm.sql' });
        console.error('Erro ao registrar FCM:', error);
        res.status(500).json({ error: 'Erro ao registrar token FCM' });
    }
});

// ========== ENDPOINTS TECHNICIAN ==========
const technicianRouter = express.Router();
const JWT_SECRET_TECH = process.env.JWT_SECRET_TECHNICIAN || process.env.JWT_SECRET;

// POST /technician/auth/login - Login (public, no auth middleware)
technicianRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (!JWT_SECRET_TECH) {
    return res.status(500).json({ error: 'JWT secret not configured' });
  }
  try {
    const tech = await db.queryOne(
      'SELECT id, email, password_hash FROM technician_users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    if (!tech) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const ok = await bcrypt.compare(password, tech.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { sub: tech.id, email: tech.email },
      JWT_SECRET_TECH,
      { expiresIn: '7d' }
    );
    res.json({ token });
  } catch (e) {
    console.error('Technician login error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

technicianRouter.use(verifyTechnicianJwt);

// GET /technician/works - List works assigned to this technician
technicianRouter.get('/works', async (req, res) => {
  try {
    const technicianId = req.technician.id;
    const result = await db.query(
      `SELECT w.* FROM works w
       INNER JOIN work_assignments wa ON wa.work_id = w.id
       WHERE wa.technician_id = $1
       ORDER BY w.created_at DESC`,
      [technicianId]
    );
    const works = result.rows || [];
    res.json({ works, total: works.length });
  } catch (error) {
    if (error.code === '42P01') {
      return res.json({ works: [], total: 0 });
    }
    console.error('Technician works list error:', error);
    res.status(500).json({ error: 'Failed to list works' });
  }
});

// GET /technician/works/:id - Work detail (only if assigned)
technicianRouter.get('/works/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.technician.id;
    const assignment = await db.queryOne(
      'SELECT 1 FROM work_assignments WHERE work_id = $1 AND technician_id = $2',
      [id, technicianId]
    );
    if (!assignment) {
      return res.status(403).json({ error: 'Not assigned to this work' });
    }
    const work = await db.queryOne('SELECT * FROM works WHERE id = $1', [id]);
    if (!work) return res.status(404).json({ error: 'Work not found' });
    const timelineResult = await db.query(
      'SELECT * FROM timeline_entries WHERE work_id = $1 ORDER BY date DESC, created_at DESC',
      [id]
    );
    const timeline = timelineResult.rows || [];
    res.json({
      work: {
        id: work.id,
        name: work.name,
        description: work.description,
        client_name: work.client_name,
        client_email: work.client_email,
        start_date: work.start_date,
        end_date: work.end_date,
        status: work.status,
        cover_image_url: work.cover_image_url,
        access_token: work.access_token,
      },
      timeline: timeline.map(e => ({
        id: e.id,
        work_id: e.work_id,
        type: e.type,
        media_url: e.media_url,
        thumbnail_url: e.thumbnail_url,
        title: e.title,
        description: e.description,
        date: e.date,
        order: e.order,
      })),
    });
  } catch (error) {
    console.error('Technician work detail error:', error);
    res.status(500).json({ error: 'Failed to get work' });
  }
});

// POST /technician/works/:id/timeline/upload - Upload media (only if assigned)
technicianRouter.post('/works/:id/timeline/upload', timelineUploadMw, async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.technician.id;
    const { title, description, date, type } = req.body;
    const file = req.file;

    const assignment = await db.queryOne(
      'SELECT 1 FROM work_assignments WHERE work_id = $1 AND technician_id = $2',
      [id, technicianId]
    );
    if (!assignment) {
      return res.status(403).json({ error: 'Not assigned to this work' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No file sent' });
    }

    const detectedType = file.mimetype.startsWith('image') ? 'image' : 'video';
    const size = file.size ?? file.buffer?.length ?? 0;
    if (detectedType === 'image' && size > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: 'Image max 20 MB' });
    }
    if (detectedType === 'video' && size > MAX_VIDEO_BYTES) {
      return res.status(413).json({ error: 'Video max 300 MB' });
    }

    let mediaUrl;
    let thumbnailUrl = null;

    if (cloudinary.isConfigured()) {
      const resourceType = detectedType === 'image' ? 'image' : 'video';
      if (!file.buffer) {
        return res.status(400).json({ error: 'File not available for upload' });
      }
      const result = await cloudinary.uploadBuffer(file.buffer, {
        folder: `ox-uploads/obras/${id}`,
        resourceType,
      });
      mediaUrl = result.secure_url;
      thumbnailUrl = result.thumbnail_url || null;
    } else {
      mediaUrl = `/uploads/works/${id}/${file.filename}`;
      if (detectedType === 'image') {
        thumbnailUrl = mediaUrl;
      } else if (detectedType === 'video') {
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
    console.error('Technician upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// GET /technician/tools - List active tools (shop catalog)
technicianRouter.get('/tools', async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM tools WHERE active = true ORDER BY name"
    );
    const tools = result.rows || [];
    res.json({ tools, total: tools.length });
  } catch (error) {
    if (error.code === '42P01') {
      return res.json({ tools: [], total: 0 });
    }
    console.error('Technician tools list error:', error);
    res.status(500).json({ error: 'Failed to list tools' });
  }
});

// POST /technician/tool-orders - Create order (items: [{ tool_id, quantity }], notes?)
technicianRouter.post('/tool-orders', async (req, res) => {
  try {
    const technicianId = req.technician.id;
    const { items, notes } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array required with at least one { tool_id, quantity }' });
    }
    const validItems = items.filter((it) => it && it.tool_id && (parseInt(it.quantity, 10) || 0) >= 1);
    if (validItems.length === 0) {
      return res.status(400).json({ error: 'Each item must have tool_id and quantity >= 1' });
    }
    const toolIds = [...new Set(validItems.map((it) => it.tool_id))];
    const toolsCheck = await db.query(
      'SELECT id FROM tools WHERE active = true AND id = ANY($1::uuid[])',
      [toolIds]
    );
    const foundIds = new Set((toolsCheck.rows || []).map((r) => r.id));
    const missing = toolIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      return res.status(400).json({
        error: 'One or more tools not found or inactive. Add tools in Admin > Ferramentas first.',
        detail: missing.length === 1 ? `Tool id ${missing[0]} not found.` : `${missing.length} tools not found.`,
      });
    }
    const techExists = await db.queryOne('SELECT 1 FROM technician_users WHERE id = $1', [technicianId]);
    if (!techExists) {
      return res.status(401).json({ error: 'Session invalid. Please log in again.' });
    }
    const orderResult = await db.query(
      `INSERT INTO tool_orders (technician_id, status, notes)
       VALUES ($1, 'pending', $2)
       RETURNING *`,
      [technicianId, notes || null]
    );
    const order = orderResult.rows[0];
    for (const item of validItems) {
      const qty = parseInt(item.quantity, 10) || 1;
      await db.query(
        `INSERT INTO tool_order_items (tool_order_id, tool_id, quantity)
         VALUES ($1, $2, $3)`,
        [order.id, item.tool_id, qty]
      );
    }
    sendPushNotificationToAll(
      'New tool request',
      'A technician has requested tools',
      { url: '/tool-orders', toolOrderId: order.id }
    ).catch((err) => console.error('Push notification error (order still created):', err));
    res.status(201).json({ order: { id: order.id, status: order.status, created_at: order.created_at } });
  } catch (error) {
    console.error('Technician tool order create error:', error);
    if (error.code === '42P01') {
      return res.status(503).json({ error: 'Tool orders not configured. Run schema-technicians-tools.sql on the database.' });
    }
    if (error.code === '23503') {
      const detail = error.detail ? ` (${error.detail})` : '';
      return res.status(400).json({
        error: 'Invalid technician or tool id' + detail,
        detail: error.detail,
      });
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /technician/tool-orders - List my orders
technicianRouter.get('/tool-orders', async (req, res) => {
  try {
    const technicianId = req.technician.id;
    const result = await db.query(
      'SELECT * FROM tool_orders WHERE technician_id = $1 ORDER BY created_at DESC',
      [technicianId]
    );
    const orders = result.rows || [];
    res.json({ orders, total: orders.length });
  } catch (error) {
    if (error.code === '42P01') {
      return res.json({ orders: [], total: 0 });
    }
    console.error('Technician tool orders list error:', error);
    res.status(500).json({ error: 'Failed to list orders' });
  }
});

// GET /technician/tool-orders/:id - Order detail (own only)
technicianRouter.get('/tool-orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.technician.id;
    const order = await db.queryOne(
      'SELECT * FROM tool_orders WHERE id = $1 AND technician_id = $2',
      [id, technicianId]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const itemsResult = await db.query(
      `SELECT toi.*, t.name as tool_name, t.description as tool_description
       FROM tool_order_items toi
       JOIN tools t ON t.id = toi.tool_id
       WHERE toi.tool_order_id = $1`,
      [id]
    );
    const items = itemsResult.rows || [];
    res.json({
      order: {
        id: order.id,
        status: order.status,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      items: items.map(i => ({
        id: i.id,
        tool_id: i.tool_id,
        tool_name: i.tool_name,
        tool_description: i.tool_description,
        quantity: i.quantity,
      })),
    });
  } catch (error) {
    console.error('Technician tool order detail error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

app.use('/technician', technicianRouter);

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
    console.log(`📁 Endpoints admin - Auth:`);
    console.log(`   POST /admin/auth/login`);
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
    console.log(`   POST /admin/push/fcm-register`);
    console.log(`📁 Endpoints technician:`);
    console.log(`   POST /technician/auth/login`);
    console.log(`   GET  /technician/works`);
    console.log(`   GET  /technician/works/:id`);
    console.log(`   POST /technician/works/:id/timeline/upload`);
    console.log(`   GET  /technician/tools`);
    console.log(`   POST /technician/tool-orders`);
    console.log(`   GET  /technician/tool-orders`);
    console.log(`   GET  /technician/tool-orders/:id`);
});
