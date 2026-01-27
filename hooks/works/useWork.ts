import { useQuery } from '@tanstack/react-query';

export interface Work {
    id: string;
    name: string;
    description: string;
    clientName: string;
    clientEmail: string;
    startDate: string;
    endDate: string;
    status: 'planned' | 'in_progress' | 'completed';
    coverImageUrl: string;
    accessToken: string;
}

export interface TimelineEntry {
    id: string;
    workId: string;
    type: 'image' | 'video' | 'note';
    mediaUrl: string;
    thumbnailUrl: string;
    title: string;
    description: string;
    date: string;
    order: number;
}

export interface Comment {
    id: string;
    workId: string;
    authorName: string;
    authorEmail: string;
    content: string;
    createdAt: string;
    approved: boolean;
}

interface WorkData {
    work: Work;
    timeline: TimelineEntry[];
    comments: Comment[];
}

const fetchWorkData = async (token: string): Promise<WorkData> => {
    const response = await fetch(`http://localhost:4000/api/works/${token}`);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Obra não encontrada');
        }
        throw new Error('Falha ao buscar dados da obra');
    }
    return response.json();
};

export const useWork = (token: string) => {
    return useQuery({
        queryKey: ['work', token],
        queryFn: () => fetchWorkData(token),
        enabled: !!token,
    });
};

export const useAddComment = () => {
    // TODO: Implementar mutation para adicionar comentário
    return {
        mutate: async (data: { token: string; authorName: string; authorEmail: string; content: string }) => {
            console.log('Adding comment:', data);
            return new Promise((resolve) => setTimeout(resolve, 1000));
        },
    };
};

export const useUploadMedia = () => {
    // TODO: Implementar mutation para upload de mídia
    return {
        mutate: async (data: { token: string; file: File; title: string; description: string }) => {
            console.log('Uploading media:', data);
            return new Promise((resolve) => setTimeout(resolve, 2000));
        },
    };
};