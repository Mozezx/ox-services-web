
export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  imageUrl: string;
  altText: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  videoUrl?: string;
  altText: string;
}

export interface Lead {
  fullName: string;
  company: string;
  email: string;
  phone?: string;
  message: string;
}

export interface Stat {
  value: string;
  label: string;
}

// Extensão para import.meta.env do Vite
interface ImportMeta {
  env: {
    VITE_SUPABASE_URL?: string;
    VITE_SUPABASE_ANON_KEY?: string;
    GEMINI_API_KEY?: string;
    API_KEY?: string;
  };
}
