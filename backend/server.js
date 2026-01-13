require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
