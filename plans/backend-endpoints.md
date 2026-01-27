# Endpoints Backend - Admin Obras

## Base URL
`/admin` (prefixo para todos endpoints de admin)

## Autenticação
Todos endpoints requerem autenticação Clerk. O frontend deve incluir o token JWT no header `Authorization: Bearer <clerk_session_token>`. O backend valida o token usando a SDK do Clerk (`@clerk/backend`).

## Endpoints

### 1. Listar Obras
`GET /admin/works`

**Query Params:**
- `status` (opcional): filtrar por status
- `page` (opcional): paginação
- `limit` (opcional): itens por página (default 20)

**Response:**
```json
{
  "works": [
    {
      "id": "uuid",
      "name": "Reforma Residencial",
      "description": "...",
      "client_name": "Família Silva",
      "client_email": "silva@email.com",
      "start_date": "2024-03-15",
      "end_date": "2024-06-30",
      "status": "in_progress",
      "cover_image_url": "/uploads/cover.jpg",
      "access_token": "abc123-token",
      "created_at": "2024-03-10T10:00:00Z",
      "updated_at": "2024-03-10T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

### 2. Criar Obra
`POST /admin/works`

**Body:**
```json
{
  "name": "Reforma Residencial",
  "description": "Reforma completa de cozinha e banheiro",
  "client_name": "Família Silva",
  "client_email": "silva@email.com",
  "start_date": "2024-03-15",
  "end_date": "2024-06-30",
  "status": "planned",
  "cover_image_url": "/uploads/cover.jpg"
}
```

**Response:** 201 Created com objeto da obra (inclui `access_token` gerado).

### 3. Obter Obra por ID
`GET /admin/works/:id`

**Response:** objeto da obra.

### 4. Atualizar Obra
`PUT /admin/works/:id`

**Body:** campos a atualizar (parcial).

**Response:** obra atualizada.

### 5. Excluir Obra
`DELETE /admin/works/:id`

**Response:** 204 No Content.

### 6. Upload de Imagem para Timeline
`POST /admin/works/:id/timeline/upload`

**Content-Type:** `multipart/form-data`

**Fields:**
- `file` (obrigatório): arquivo de imagem/vídeo
- `title` (obrigatório): título da entrada
- `description` (opcional): descrição
- `date` (opcional): data da entrada (YYYY-MM-DD)
- `type` (obrigatório): `image` ou `video`

**Processamento:**
- Salvar arquivo em `public/uploads/works/<work_id>/<timestamp>_<filename>`
- Gerar thumbnail para vídeos (usando ffmpeg)
- Inserir entrada na tabela `timeline_entries`

**Response:**
```json
{
  "entry": {
    "id": "uuid",
    "work_id": "uuid",
    "type": "image",
    "media_url": "/uploads/works/.../image.jpg",
    "thumbnail_url": null,
    "title": "Demolição da parede",
    "description": "Remoção da parede antiga",
    "date": "2024-03-20",
    "order": 5,
    "created_at": "2024-03-25T10:00:00Z"
  }
}
```

### 7. Listar Entradas da Timeline de uma Obra
`GET /admin/works/:id/timeline`

**Query Params:**
- `page`, `limit` (opcional)

**Response:** array de `timeline_entries`.

### 8. Excluir Entrada da Timeline
`DELETE /admin/timeline/:entryId`

**Response:** 204 No Content.

### 9. Reordenar Entradas
`PUT /admin/works/:id/timeline/reorder`

**Body:**
```json
{
  "order": ["entry_id_1", "entry_id_2", "entry_id_3"]
}
```

### 10. Listar Comentários (para aprovação)
`GET /admin/comments`

**Query Params:**
- `approved` (boolean): filtrar aprovados/não aprovados
- `work_id` (opcional)

**Response:** array de comentários.

### 11. Aprovar/Rejeitar Comentário
`PUT /admin/comments/:id`

**Body:**
```json
{
  "approved": true
}
```

## Middleware de Autenticação
Criar middleware `verifyClerkAuth` que:
1. Extrai token do header `Authorization`
2. Usa Clerk SDK para verificar sessão
3. Obtém userId e roles
4. Verifica se o usuário tem role `admin` (configurável)
5. Anexa `req.user` com dados do usuário

## Configuração do Clerk no Backend
Instalar `@clerk/backend` e configurar com a secret key.

```javascript
const clerk = require('@clerk/backend');

const verifyClerkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  const token = authHeader.substring(7);
  try {
    const session = await clerk.verifyToken(token);
    req.user = session;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

## Armazenamento de Arquivos
Usar `multer` para upload. Configurar destino dinâmico baseado no workId.

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const workId = req.params.id;
    const dir = `public/uploads/works/${workId}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}_${file.originalname}`);
  }
});

const upload = multer({ storage });