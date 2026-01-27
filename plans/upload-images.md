# Upload de Imagens no VPS

## Objetivo
Permitir que administradores façam upload de imagens e vídeos para a timeline de uma obra, armazenando os arquivos localmente no VPS (na pasta `public/uploads/`). Os arquivos serão servidos via Express static.

## Backend

### Dependências
- `multer` para processar multipart/form-data
- `sharp` para redimensionamento de imagens (opcional)
- `ffmpeg` para geração de thumbnails de vídeo (opcional, pode ser instalado no sistema)

Instalar:
```bash
cd backend
npm install multer sharp
```

### Configuração do Multer
Criar `backend/middleware/upload.js`:

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garantir que a pasta uploads existe
const uploadsDir = 'public/uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const workId = req.params.id;
    const dir = `${uploadsDir}/works/${workId}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s/g, '_');
    cb(null, `${timestamp}_${name}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter
});

module.exports = upload;
```

### Endpoint de Upload
Em `server.js`:

```javascript
const upload = require('./middleware/upload');

// POST /admin/works/:id/timeline/upload
app.post('/admin/works/:id/timeline/upload', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Determinar tipo a partir do mimetype
    const detectedType = file.mimetype.startsWith('image') ? 'image' : 'video';

    // Para vídeos, gerar thumbnail (simplificado)
    let thumbnailUrl = null;
    if (detectedType === 'video') {
      // Lógica para gerar thumbnail usando ffmpeg
      // thumbnailUrl = `/uploads/works/${id}/thumb_${file.filename}.jpg`;
    }

    const mediaUrl = `/uploads/works/${id}/${file.filename}`;

    // Inserir no banco
    const { data, error } = await supabase
      .from('timeline_entries')
      .insert([{
        work_id: id,
        type: detectedType,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl,
        title,
        description,
        date: date || new Date().toISOString().split('T')[0],
        order: 0, // definir ordem posteriormente
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ entry: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer upload' });
  }
});
```

### Servir Arquivos Estáticos
Adicionar em `server.js` antes das rotas:

```javascript
app.use('/uploads', express.static('public/uploads'));
```

Isso permitirá acessar arquivos via `http://localhost:4000/uploads/works/.../image.jpg`.

## Frontend

### Componente UploadModal
Criar `admin/components/timeline/UploadModal.tsx`:

```tsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('date', date);
    formData.append('type', file.type.startsWith('image') ? 'image' : 'video');

    setUploading(true);
    try {
      await api.post(`/admin/works/${id}/timeline/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Upload de Mídia</h2>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <input type="text" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button type="submit" disabled={uploading}>
            {uploading ? 'Enviando...' : 'Enviar'}
          </button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}
```

### Hook useUpload
Criar `admin/hooks/useUpload.ts` para abstrair a lógica:

```ts
import api from '../lib/api';

export const useUpload = (workId) => {
  const upload = async (formData) => {
    const { data } = await api.post(`/admin/works/${workId}/timeline/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  };
  return { upload };
};
```

## Processamento Adicional (Opcional)

### Redimensionamento de Imagens
Usar `sharp` para criar versões otimizadas:

```javascript
const sharp = require('sharp');
const path = require('path');

async function processImage(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);
  const resizedPath = `${dir}/${name}_1024${ext}`;
  await sharp(filePath)
    .resize(1024, null, { withoutEnlargement: true })
    .toFile(resizedPath);
  return resizedPath;
}
```

### Thumbnail de Vídeo
Requer `ffmpeg` instalado no sistema. Pode usar `fluent-ffmpeg`:

```javascript
const ffmpeg = require('fluent-ffmpeg');

function generateThumbnail(videoPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['00:00:01'],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
      })
      .on('end', () => resolve(outputPath))
      .on('error', reject);
  });
}
```

## Segurança
- Validar extensões e mimetypes
- Limitar tamanho de arquivo
- Não executar arquivos enviados
- Considerar upload para um bucket S3 no futuro

## Deploy no VPS
- A pasta `public/uploads` deve ter permissões de escrita para o usuário do Node.
- Configurar nginx para servir arquivos estáticos diretamente (mais eficiente) ou continuar via Express.
- Considerar backup regular dos uploads.