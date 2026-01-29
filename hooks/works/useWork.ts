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

export interface WorkStats {
    progress: number;
    daysWorked: number;
    daysRemaining: number;
    totalDays: number;
    photosCount: number;
    videosCount: number;
    notesCount: number;
    totalEntries: number;
    commentsCount: number;
    lastUpdate: string;
}

interface WorkData {
    work: Work;
    timeline: TimelineEntry[];
    comments: Comment[];
    stats: WorkStats;
}

const getApiBase = () => {
    const env = import.meta.env.VITE_API_URL ?? '';
    if (env) return env.replace(/\/$/, '');
    if (import.meta.env.DEV) return 'http://localhost:4000';
    return ''; // produção: path relativo /api (mesmo domínio)
};

const fetchWorkData = async (token: string): Promise<WorkData> => {
    const base = getApiBase();
    const url = base ? `${base}/api/works/${token}` : `/api/works/${token}`;
    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Obra não encontrada');
        }
        throw new Error('Falha ao buscar dados da obra');
    }
    return response.json();
};

/** Intervalo de refetch para atualizações em tempo real na tela do cliente (ms) */
const WORK_REFETCH_INTERVAL = 15_000;

export const useWork = (token: string) => {
    return useQuery({
        queryKey: ['work', token],
        queryFn: () => fetchWorkData(token),
        enabled: !!token,
        refetchInterval: WORK_REFETCH_INTERVAL,
        refetchIntervalInBackground: false,
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