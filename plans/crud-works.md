# Implementação CRUD de Obras (Tokens)

## Backend

### 1. Instalar Dependências
No diretório `backend/`, instalar:
- `@clerk/backend` para autenticação
- `multer` para upload (já planejado)
- `pg` ou `postgres` para Supabase (ou usar `@supabase/supabase-js`)

```bash
cd backend
npm install @clerk/backend multer
```

### 2. Configurar Clerk Middleware
Criar `backend/middleware/clerkAuth.js`:

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
    // Verificar se o usuário tem role admin (opcional)
    // Pode ser feito via Clerk Organizations ou metadados
    req.user = session;
    next();
  } catch (error) {
    console.error('Clerk auth error:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = verifyClerkAuth;
```

### 3. Configurar Conexão com Supabase
Criar `backend/db.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // usar service role para admin

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
```

### 4. Implementar Endpoints
Em `server.js`, adicionar rotas após os imports:

```javascript
const verifyClerkAuth = require('./middleware/clerkAuth');
const supabase = require('./db');

// Aplicar middleware a todas as rotas /admin
app.use('/admin', verifyClerkAuth);

// GET /admin/works
app.get('/admin/works', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ works: data, total: data.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar obras' });
  }
});

// POST /admin/works
app.post('/admin/works', async (req, res) => {
  try {
    const { name, description, client_name, client_email, start_date, end_date, status, cover_image_url } = req.body;
    const access_token = uuidv4();
    const { data, error } = await supabase
      .from('works')
      .insert([{
        name,
        description,
        client_name,
        client_email,
        start_date,
        end_date,
        status: status || 'planned',
        cover_image_url,
        access_token,
      }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar obra' });
  }
});

// PUT /admin/works/:id
app.put('/admin/works/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('works')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar obra' });
  }
});

// DELETE /admin/works/:id
app.delete('/admin/works/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('works')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir obra' });
  }
});
```

### 5. Atualizar Variáveis de Ambiente
Adicionar ao `.env` do backend:
```
CLERK_SECRET_KEY=sk_test_...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Frontend

### 1. Criar Cliente API
Em `admin/lib/api.ts`:

```typescript
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar token Clerk
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clerk_token'); // ou usar Clerk session
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 2. Hook useWorks
Em `admin/hooks/useWorks.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const fetchWorks = async () => {
  const { data } = await api.get('/admin/works');
  return data.works;
};

const createWork = async (workData) => {
  const { data } = await api.post('/admin/works', workData);
  return data;
};

const updateWork = async ({ id, ...updates }) => {
  const { data } = await api.put(`/admin/works/${id}`, updates);
  return data;
};

const deleteWork = async (id) => {
  await api.delete(`/admin/works/${id}`);
};

export const useWorks = () => {
  return useQuery({
    queryKey: ['works'],
    queryFn: fetchWorks,
  });
};

export const useCreateWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWork,
    onSuccess: () => {
      queryClient.invalidateQueries(['works']);
    },
  });
};

export const useUpdateWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWork,
    onSuccess: () => {
      queryClient.invalidateQueries(['works']);
    },
  });
};

export const useDeleteWork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWork,
    onSuccess: () => {
      queryClient.invalidateQueries(['works']);
    },
  });
};
```

### 3. Página WorksPage
Em `admin/pages/WorksPage.tsx`:

```tsx
import { useWorks, useDeleteWork } from '../hooks/useWorks';
import WorksTable from '../components/works/WorksTable';
import { Link } from 'react-router-dom';

export default function WorksPage() {
  const { data: works, isLoading, error } = useWorks();
  const deleteWork = useDeleteWork();

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar obras</div>;

  return (
    <div>
      <h1>Obras</h1>
      <Link to="/admin/works/new">Nova Obra</Link>
      <WorksTable works={works} onDelete={(id) => deleteWork.mutate(id)} />
    </div>
  );
}
```

### 4. Componente WorksTable
Renderizar tabela com ações.

### 5. Página WorkFormPage
Formulário reutilizável para criação e edição.

## Geração de Token
O token é gerado automaticamente no backend usando `uuidv4`. No frontend, após criar uma obra, exibir o token para o administrador copiar e compartilhar com o cliente.

## Validação
- Validar campos obrigatórios no frontend (usar Zod ou Yup)
- Validar no backend também (express‑validator)

## Testes
- Testar endpoints com Postman/Insomnia
- Testar UI com interações básicas