import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Video, X, Image, FileText, Plus, Check, AlertCircle, Loader, Cloud, Zap, Sparkles, HardHat } from 'lucide-react';

interface UploadButtonProps {
    workToken: string;
    onUploadSuccess?: () => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ workToken, onUploadSuccess }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploadType, setUploadType] = useState<'image' | 'video' | 'note'>('image');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Fechar modal ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (selectedFile: File) => {
        // Validar tipo de arquivo
        const isImage = selectedFile.type.startsWith('image/');
        const isVideo = selectedFile.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
            // Se não for imagem nem vídeo, tratar como nota
            setUploadType('note');
        } else {
            setUploadType(isImage ? 'image' : 'video');
        }
        
        // Validar tamanho
        const maxSize = uploadType === 'video' ? 300 * 1024 * 1024 : 20 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            alert(`Arquivo muito grande. Tamanho máximo: ${uploadType === 'video' ? '300MB' : '20MB'}`);
            return;
        }
        
        setFile(selectedFile);
        
        // Sugerir título baseado no nome do arquivo
        if (!title) {
            const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
            setTitle(fileName.replace(/[-_]/g, ' '));
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const simulateUpload = () => {
        setIsUploading(true);
        setUploadProgress(0);
        
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        // Upload concluído
                        setIsUploading(false);
                        setUploadProgress(0);
                        setFile(null);
                        setTitle('');
                        setDescription('');
                        setIsOpen(false);
                        
                        if (onUploadSuccess) {
                            onUploadSuccess();
                        }
                        
                        // Feedback visual
                        const event = new CustomEvent('upload-complete', {
                            detail: { type: uploadType, title }
                        });
                        window.dispatchEvent(event);
                    }, 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file && uploadType !== 'note') return;
        if (!title.trim()) return;

        simulateUpload();
    };

    const getTypeIcon = (type: 'image' | 'video' | 'note') => {
        switch (type) {
            case 'image': return <Camera className="w-5 h-5" />;
            case 'video': return <Video className="w-5 h-5" />;
            case 'note': return <FileText className="w-5 h-5" />;
        }
    };

    const getTypeColor = (type: 'image' | 'video' | 'note') => {
        switch (type) {
            case 'image': return 'from-steel-500 to-steel-700';
            case 'video': return 'from-wood-500 to-wood-700';
            case 'note': return 'from-concrete-500 to-concrete-700';
        }
    };

    const getTypeLabel = (type: 'image' | 'video' | 'note') => {
        switch (type) {
            case 'image': return 'Foto';
            case 'video': return 'Vídeo';
            case 'note': return 'Nota';
        }
    };

    return (
        <>
            {/* Botão flutuante principal com expansão */}
            <div className="fixed bottom-6 right-6 z-50">
                {isExpanded && (
                    <div className="absolute bottom-16 right-0 mb-4 animate-scale-in">
                        <div className="bg-white rounded-xl shadow-2xl border border-concrete-200 p-3 min-w-[200px]">
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        setUploadType('image');
                                        setIsOpen(true);
                                        setIsExpanded(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-steel-50 text-concrete-700 hover:text-steel-700 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-steel-500 to-steel-700 flex items-center justify-center text-white">
                                        <Camera className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Enviar Foto</div>
                                        <div className="text-xs text-concrete-500">JPG, PNG, GIF</div>
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => {
                                        setUploadType('video');
                                        setIsOpen(true);
                                        setIsExpanded(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-wood-50 text-concrete-700 hover:text-wood-700 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wood-500 to-wood-700 flex items-center justify-center text-white">
                                        <Video className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Enviar Vídeo</div>
                                        <div className="text-xs text-concrete-500">MP4, MOV, AVI</div>
                                    </div>
                                </button>
                                
                                <button
                                    onClick={() => {
                                        setUploadType('note');
                                        setIsOpen(true);
                                        setIsExpanded(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-concrete-50 text-concrete-700 hover:text-concrete-800 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-concrete-500 to-concrete-700 flex items-center justify-center text-white">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Adicionar Nota</div>
                                        <div className="text-xs text-concrete-500">Texto descritivo</div>
                                    </div>
                                </button>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-concrete-100">
                                <div className="flex items-center gap-2 text-concrete-500 text-xs px-2">
                                    <HardHat className="w-3 h-3" />
                                    <span>Documente o progresso da obra</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Botão principal */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`relative bg-gradient-to-br from-steel-600 to-steel-800 text-white p-5 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:shadow-3xl hover:scale-105 group ${
                        isExpanded ? 'rotate-45' : ''
                    }`}
                    title="Adicionar conteúdo à timeline"
                >
                    <Plus className={`w-7 h-7 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                    
                    {/* Efeito de brilho */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full"></div>
                    
                    {/* Badge de notificação */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-wood-500 to-wood-700 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                        3
                    </div>
                </button>
            </div>

            {/* Modal de upload */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in">
                    <div 
                        ref={modalRef}
                        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border border-concrete-200 animate-scale-in"
                    >
                        {/* Cabeçalho */}
                        <div className="relative p-6 border-b border-concrete-100">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(uploadType)} flex items-center justify-center text-white`}>
                                    {getTypeIcon(uploadType)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-concrete-800 text-industrial-display">
                                        Adicionar {getTypeLabel(uploadType)}
                                    </h3>
                                    <p className="text-concrete-500 mt-1">
                                        Compartilhe o progresso da obra com a equipe e cliente
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 p-2 hover:bg-concrete-100 rounded-lg transition-colors"
                                disabled={isUploading}
                            >
                                <X className="w-6 h-6 text-concrete-400" />
                            </button>
                        </div>

                        {/* Progresso do upload */}
                        {isUploading && (
                            <div className="px-6 py-4 bg-gradient-to-r from-steel-50 to-steel-100 border-b border-steel-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Loader className="w-5 h-5 text-steel-600 animate-spin" />
                                        <span className="font-semibold text-steel-700">Processando upload...</span>
                                    </div>
                                    <span className="font-bold text-steel-800">{uploadProgress}%</span>
                                </div>
                                <div className="h-2 bg-concrete-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-steel-500 to-steel-700 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <div className="flex items-center gap-2 mt-3 text-sm text-steel-600">
                                    <Zap className="w-4 h-4" />
                                    <span>Otimizando {uploadType === 'image' ? 'imagem' : uploadType === 'video' ? 'vídeo' : 'nota'} para a timeline</span>
                                </div>
                            </div>
                        )}

                        {/* Formulário */}
                        {!isUploading && (
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Tipo de conteúdo */}
                                <div>
                                    <label className="block text-sm font-medium text-concrete-700 mb-3">
                                        Tipo de conteúdo
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['image', 'video', 'note'] as const).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setUploadType(type)}
                                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                                    uploadType === type
                                                        ? `border-steel-500 bg-gradient-to-b ${getTypeColor(type)}/10`
                                                        : 'border-concrete-200 hover:border-concrete-300 hover:bg-concrete-50'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                                                    uploadType === type 
                                                        ? `bg-gradient-to-br ${getTypeColor(type)} text-white`
                                                        : 'bg-concrete-100 text-concrete-400'
                                                }`}>
                                                    {getTypeIcon(type)}
                                                </div>
                                                <span className={`font-medium ${
                                                    uploadType === type ? 'text-steel-700' : 'text-concrete-600'
                                                }`}>
                                                    {getTypeLabel(type)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Upload de arquivo (se não for nota) */}
                                {uploadType !== 'note' && (
                                    <div>
                                        <label className="block text-sm font-medium text-concrete-700 mb-2">
                                            {uploadType === 'image' ? 'Selecione uma foto' : 'Selecione um vídeo'}
                                        </label>
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                                                dragOver
                                                    ? 'border-steel-500 bg-steel-50'
                                                    : file
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-concrete-300 hover:border-steel-400 hover:bg-concrete-50'
                                            }`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                id="file-upload"
                                                className="hidden"
                                                accept={uploadType === 'image' ? 'image/*' : 'video/*'}
                                                onChange={handleFileChange}
                                            />
                                            
                                            {file ? (
                                                <div className="space-y-3">
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                                                        <Check className="w-5 h-5" />
                                                        <span className="font-medium">Arquivo selecionado</span>
                                                    </div>
                                                    <div className="text-concrete-700">
                                                        <div className="font-medium">{file.name}</div>
                                                        <div className="text-sm text-concrete-500">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB • {uploadType === 'image' ? 'Imagem' : 'Vídeo'}
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFile(null);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium inline-flex items-center gap-1"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Remover arquivo
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-concrete-100 to-concrete-300 flex items-center justify-center mb-4">
                                                        {dragOver ? (
                                                            <Cloud className="w-8 h-8 text-steel-600" />
                                                        ) : (
                                                            <Upload className="w-8 h-8 text-concrete-400" />
                                                        )}
                                                    </div>
                                                    <div className="text-concrete-600">
                                                        <div className="font-medium">
                                                            {dragOver ? 'Solte o arquivo aqui' : 'Clique ou arraste o arquivo'}
                                                        </div>
                                                        <div className="text-sm text-concrete-500 mt-1">
                                                            {uploadType === 'image'
                                                                ? 'JPG, PNG, GIF até 20MB'
                                                                : 'MP4, MOV, AVI até 300MB'}
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 inline-flex items-center gap-2 text-xs text-concrete-400">
                                                        <Sparkles className="w-3 h-3" />
                                                        <span>Upload otimizado para timeline</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Campos de título e descrição */}
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-concrete-700 mb-2">
                                            Título *
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Ex: Fundação concluída, Instalação elétrica, etc."
                                            className="w-full px-4 py-3 rounded-xl border border-concrete-300 focus:border-steel-500 focus:ring-2 focus:ring-steel-200 focus:outline-none transition-all bg-white text-concrete-800 placeholder-concrete-400"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-concrete-700 mb-2">
                                            Descrição
                                        </label>
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Descreva o que está acontecendo nesta etapa da obra..."
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-concrete-300 focus:border-steel-500 focus:ring-2 focus:ring-steel-200 focus:outline-none transition-all bg-white text-concrete-800 placeholder-concrete-400 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Rodapé */}
                                <div className="pt-4 border-t border-concrete-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-concrete-500">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>Esta publicação será visível para todos os envolvidos na obra</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsOpen(false)}
                                                className="px-5 py-2.5 rounded-lg border border-concrete-300 text-concrete-700 hover:bg-concrete-50 transition-colors font-medium"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!title.trim() || (uploadType !== 'note' && !file)}
                                                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-steel-600 to-steel-800 text-white font-medium hover:from-steel-700 hover:to-steel-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                                            >
                                                {uploadType === 'note' ? 'Publicar Nota' : 'Enviar Arquivo'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default UploadButton;