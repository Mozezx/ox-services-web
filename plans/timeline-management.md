# Gerenciamento de Timeline

## Funcionalidades
- Listar entradas de uma obra (imagens/vídeos) ordenadas por `order` ou `date`
- Adicionar nova entrada via upload (já implementado)
- Excluir entrada
- Reordenar entradas via drag‑and‑drop ou setas
- Editar título/descrição/data de uma entrada existente

## Backend

### Endpoints Adicionais

#### 1. Listar Timeline de uma Obra
`GET /admin/works/:id/timeline`

**Response:**
```json
{
  "entries": [
    {
      "id": "uuid",
      "work_id": "uuid",
      "type": "image",
      "media_url": "/uploads/works/.../image.jpg",
      "thumbnail_url": null,
      "title": "Demolição da parede",
      "description": "Remoção da parede antiga",
      "date": "2024-03-20",
      "order": 1,
      "created_at": "2024-03-25T10:00:00Z"
    }
  ]
}
```

Implementação:
```javascript
app.get('/admin/works/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('timeline_entries')
      .select('*')
      .eq('work_id', id)
      .order('order', { ascending: true });
    if (error) throw error;
    res.json({ entries: data });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar timeline' });
  }
});
```

#### 2. Excluir Entrada
`DELETE /admin/timeline/:entryId`

```javascript
app.delete('/admin/timeline/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    // Opcional: buscar entry para deletar arquivo físico
    const { error } = await supabase
      .from('timeline_entries')
      .delete()
      .eq('id', entryId);
    if (error) throw error;
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir entrada' });
  }
});
```

#### 3. Atualizar Entrada (editar campos)
`PUT /admin/timeline/:entryId`

```javascript
app.put('/admin/timeline/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('timeline_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar entrada' });
  }
});
```

#### 4. Reordenar Entradas
`PUT /admin/works/:id/timeline/reorder`

Body: array de IDs na nova ordem.

```javascript
app.put('/admin/works/:id/timeline/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body; // array de IDs
    const updates = order.map((entryId, index) => ({
      id: entryId,
      order: index + 1,
    }));
    // Atualizar em lote (Supabase não suporta batch update nativo, então loop)
    for (const update of updates) {
      const { error } = await supabase
        .from('timeline_entries')
        .update({ order: update.order })
        .eq('id', update.id)
        .eq('work_id', id);
      if (error) throw error;
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao reordenar' });
  }
});
```

## Frontend

### Hook useTimeline
Criar `admin/hooks/useTimeline.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const fetchTimeline = async (workId) => {
  const { data } = await api.get(`/admin/works/${workId}/timeline`);
  return data.entries;
};

const deleteEntry = async (entryId) => {
  await api.delete(`/admin/timeline/${entryId}`);
};

const updateEntry = async ({ id, ...updates }) => {
  const { data } = await api.put(`/admin/timeline/${id}`, updates);
  return data;
};

const reorderEntries = async (workId, order) => {
  await api.put(`/admin/works/${workId}/timeline/reorder`, { order });
};

export const useTimeline = (workId) => {
  return useQuery({
    queryKey: ['timeline', workId],
    queryFn: () => fetchTimeline(workId),
    enabled: !!workId,
  });
};

export const useDeleteEntry = (workId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => {
      queryClient.invalidateQueries(['timeline', workId]);
    },
  });
};

export const useUpdateEntry = (workId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEntry,
    onSuccess: () => {
      queryClient.invalidateQueries(['timeline', workId]);
    },
  });
};

export const useReorderEntries = (workId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (order) => reorderEntries(workId, order),
    onSuccess: () => {
      queryClient.invalidateQueries(['timeline', workId]);
    },
  });
};
```

### Componente TimelineManager
Em `admin/components/timeline/TimelineManager.tsx`:

```tsx
import { useState } from 'react';
import { useTimeline, useDeleteEntry, useReorderEntries } from '../../hooks/useTimeline';
import UploadModal from './UploadModal';
import TimelineEntry from './TimelineEntry';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function TimelineManager({ workId }) {
  const { data: entries, isLoading } = useTimeline(workId);
  const deleteEntry = useDeleteEntry(workId);
  const reorderEntries = useReorderEntries(workId);
  const [showUpload, setShowUpload] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(entries);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const newOrder = reordered.map(e => e.id);
    reorderEntries.mutate(newOrder);
  };

  if (isLoading) return <div>Carregando timeline...</div>;

  return (
    <div>
      <h2>Timeline da Obra</h2>
      <button onClick={() => setShowUpload(true)}>Upload Nova Mídia</button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="timeline">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {entries.map((entry, index) => (
                <Draggable key={entry.id} draggableId={entry.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <TimelineEntry
                        entry={entry}
                        onDelete={() => deleteEntry.mutate(entry.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={() => {/* invalidate query */}}
      />
    </div>
  );
}
```

### Componente TimelineEntry
Exibe a mídia (imagem ou vídeo) com título, descrição, data e botões de ação.

```tsx
export default function TimelineEntry({ entry, onDelete }) {
  const isVideo = entry.type === 'video';
  return (
    <div className="timeline-entry">
      {isVideo ? (
        <video controls src={entry.media_url} poster={entry.thumbnail_url} />
      ) : (
        <img src={entry.media_url} alt={entry.title} />
      )}
      <div className="entry-details">
        <h3>{entry.title}</h3>
        <p>{entry.description}</p>
        <span>{entry.date}</span>
        <button onClick={onDelete}>Excluir</button>
        <button>Editar</button>
      </div>
    </div>
  );
}
```

### Página TimelinePage
Rota `/admin/works/:id/timeline` que renderiza o TimelineManager.

```tsx
import { useParams } from 'react-router-dom';
import TimelineManager from '../components/timeline/TimelineManager';

export default function TimelinePage() {
  const { id } = useParams();
  return (
    <div>
      <h1>Gerenciar Timeline</h1>
      <TimelineManager workId={id} />
    </div>
  );
}
```

## Estilização
- Layout em grid ou lista vertical
- Indicador visual de arrastável (handle)
- Modal de confirmação para exclusão
- Preview de imagem/vídeo com tamanho controlado

## Considerações
- Ao excluir uma entrada, também deletar o arquivo físico do VPS (opcional, mas recomendado)
- Reordenar pode ser feito com uma interface mais simples (setas para cima/baixo) como alternativa ao drag‑and‑drop
- A ordem deve ser persistida e refletida na timeline pública (cliente)