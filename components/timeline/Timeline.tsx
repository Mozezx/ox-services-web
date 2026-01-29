import React, { useState, useCallback } from 'react';
import { 
    Image, 
    Video, 
    FileText, 
    ChevronRight, 
    ZoomIn, 
    Play, 
    Download, 
    Share2, 
    Heart, 
    MessageCircle, 
    X,
    ChevronLeft,
    Calendar,
    Maximize2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface TimelineEntry {
    id: string;
    type: 'image' | 'video' | 'note';
    mediaUrl?: string;
    thumbnailUrl?: string;
    title: string;
    description: string;
    date: string;
}

interface TimelineProps {
    entries: TimelineEntry[];
}

// Video modal para reproduzir vídeos
interface VideoModalProps {
    entry: TimelineEntry;
    onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ entry, onClose }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        videoRef.current?.play().catch(() => {});
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                aria-label="Close"
            >
                <X className="w-6 h-6" />
            </button>
            <div
                className="max-w-[90vw] max-h-[85vh] w-full flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
            >
                <video
                    ref={videoRef}
                    src={entry.mediaUrl}
                    controls
                    playsInline
                    className="max-w-full max-h-[80vh] rounded-lg"
                    poster={entry.thumbnailUrl}
                />
                <div className="mt-4 px-4 py-2 bg-white/10 rounded-lg max-w-[90vw]">
                    <h3 className="text-white font-semibold">{entry.title}</h3>
                    {entry.description && (
                        <p className="text-white/70 text-sm mt-1 line-clamp-2">{entry.description}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Lightbox Component para visualizar imagens em tela cheia
interface LightboxProps {
    images: TimelineEntry[];
    currentIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, onClose, onNext, onPrev }) => {
    const currentImage = images[currentIndex];
    
    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') onNext();
            if (e.key === 'ArrowLeft') onPrev();
        };
        
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose, onNext, onPrev]);
    
    return (
        <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
                <X className="w-6 h-6" />
            </button>
            
            {/* Image Counter */}
            <div className="absolute top-4 left-4 px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium">
                {currentIndex + 1} / {images.length}
            </div>
            
            {/* Navigation - Previous */}
            {currentIndex > 0 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}
            
            {/* Main Image */}
            <div 
                className="max-w-[90vw] max-h-[85vh] relative"
                onClick={(e) => e.stopPropagation()}
            >
                <img 
                    src={currentImage.mediaUrl} 
                    alt={currentImage.title}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg"
                />
                
                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                    <h3 className="text-white font-semibold text-lg mb-1">{currentImage.title}</h3>
                    <p className="text-white/70 text-sm line-clamp-2">{currentImage.description}</p>
                </div>
            </div>
            
            {/* Navigation - Next */}
            {currentIndex < images.length - 1 && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}
            
            {/* Thumbnails Strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-xl backdrop-blur-sm max-w-[90vw] overflow-x-auto">
                {images.map((img, idx) => (
                    <button
                        key={img.id}
                        onClick={(e) => { 
                            e.stopPropagation();
                            // Navigate to this image
                            const diff = idx - currentIndex;
                            if (diff > 0) {
                                for (let i = 0; i < diff; i++) onNext();
                            } else {
                                for (let i = 0; i < Math.abs(diff); i++) onPrev();
                            }
                        }}
                        className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                            idx === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                        <img 
                            src={img.thumbnailUrl || img.mediaUrl} 
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

const Timeline: React.FC<TimelineProps> = ({ entries }) => {
    const { textData, language } = useLanguage();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [likedEntries, setLikedEntries] = useState<Set<string>>(new Set());
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [videoModalEntry, setVideoModalEntry] = useState<TimelineEntry | null>(null);

    // Filter only images for lightbox navigation
    const imageEntries = entries.filter(e => e.type === 'image' && e.mediaUrl);

    const getIcon = (type: TimelineEntry['type']) => {
        switch (type) {
            case 'image':
                return <Image className="w-4 h-4" />;
            case 'video':
                return <Video className="w-4 h-4" />;
            case 'note':
                return <FileText className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: TimelineEntry['type']) => {
        switch (type) {
            case 'image':
                return {
                    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
                    text: 'text-blue-600',
                    light: 'bg-blue-50',
                    border: 'border-blue-100'
                };
            case 'video':
                return {
                    bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
                    text: 'text-purple-600',
                    light: 'bg-purple-50',
                    border: 'border-purple-100'
                };
            case 'note':
                return {
                    bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
                    text: 'text-gray-600',
                    light: 'bg-gray-50',
                    border: 'border-gray-100'
                };
            default:
                return {
                    bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
                    text: 'text-gray-600',
                    light: 'bg-gray-50',
                    border: 'border-gray-100'
                };
        }
    };

    const getTypeLabel = (type: TimelineEntry['type']) => {
        switch (type) {
            case 'image': return textData.timeline.photo;
            case 'video': return textData.timeline.video;
            case 'note': return textData.timeline.note;
            default: return textData.timeline.record;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return textData.timeline.today;
        if (diffDays === 1) return textData.timeline.yesterday;
        if (diffDays < 7) return textData.timeline.daysAgo(diffDays);
        
        return date.toLocaleDateString(language === 'en' ? 'en-GB' :
                                      language === 'nl' ? 'nl-NL' :
                                      language === 'es' ? 'es-ES' :
                                      'fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const toggleLike = useCallback((id: string) => {
        setLikedEntries(prev => {
            const newLiked = new Set(prev);
            if (newLiked.has(id)) {
                newLiked.delete(id);
            } else {
                newLiked.add(id);
            }
            return newLiked;
        });
    }, []);

    const toggleExpand = useCallback((id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    }, []);

    const openLightbox = useCallback((entry: TimelineEntry) => {
        const imageIndex = imageEntries.findIndex(e => e.id === entry.id);
        if (imageIndex !== -1) {
            setLightboxIndex(imageIndex);
            setLightboxOpen(true);
        }
    }, [imageEntries]);

    const handleDownload = useCallback((url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    const handleShare = useCallback(async (entry: TimelineEntry) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: entry.title,
                    text: entry.description,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled or share failed
            }
        }
    }, []);

    if (entries.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex flex-col items-center p-8 bg-gray-50 rounded-2xl border border-gray-100 max-w-md">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                        <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0B242A] mb-2">
                        {textData.timeline.emptyTitle}
                    </h3>
                    <p className="text-[#0B242A]/60 text-center">
                        {textData.timeline.emptyDescription}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Lightbox */}
            {lightboxOpen && imageEntries.length > 0 && (
                <Lightbox
                    images={imageEntries}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                    onNext={() => setLightboxIndex(i => Math.min(i + 1, imageEntries.length - 1))}
                    onPrev={() => setLightboxIndex(i => Math.max(i - 1, 0))}
                />
            )}

            {/* Video modal */}
            {videoModalEntry && (
                <VideoModal
                    entry={videoModalEntry}
                    onClose={() => setVideoModalEntry(null)}
                />
            )}

            <div className="space-y-4">
                {entries.map((entry, index) => {
                    const colors = getTypeColor(entry.type);
                    const isExpanded = expandedId === entry.id;
                    const isLiked = likedEntries.has(entry.id);

                    return (
                        <div 
                            key={entry.id}
                            className="relative flex gap-3 md:gap-4 animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Timeline Line & Avatar - Hidden on mobile */}
                            <div className="hidden md:flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                                    {getIcon(entry.type)}
                                </div>
                                {index < entries.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-gradient-to-b from-gray-200 to-transparent mt-2" />
                                )}
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 pb-4 md:pb-6">
                                {/* Mobile: Full width card without border radius on sides */}
                                <div className="bg-white md:rounded-xl rounded-none -mx-4 md:mx-0 border-y md:border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                    {/* Header */}
                                    <div className="p-4 pb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {/* Mobile: Show small icon inline */}
                                                <div className={`md:hidden w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                                                    {getIcon(entry.type)}
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${colors.light} ${colors.text} ${colors.border} border`}>
                                                    {getTypeLabel(entry.type)}
                                                </span>
                                                <span className="text-xs text-gray-400">#{String(index + 1).padStart(2, '0')}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(entry.date)}
                                            </div>
                                        </div>
                                        
                                        <h4 className="text-base font-semibold text-[#0B242A] leading-snug">
                                            {entry.title}
                                        </h4>
                                    </div>

                                    {/* Media - Full width on mobile */}
                                    {entry.mediaUrl && (
                                        <div className="relative">
                                            {entry.type === 'image' ? (
                                                <div 
                                                    className="relative cursor-pointer group"
                                                    onClick={() => openLightbox(entry)}
                                                >
                                                    <img 
                                                        src={entry.mediaUrl} 
                                                        alt={entry.title}
                                                        className="w-full h-auto md:max-h-80 object-cover"
                                                        loading="lazy"
                                                        onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                                                <Maximize2 className="w-5 h-5 text-[#0B242A]" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : entry.type === 'video' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setVideoModalEntry(entry)}
                                                    className="relative w-full aspect-video bg-[#0B242A] group cursor-pointer block text-left"
                                                >
                                                    <div 
                                                        className="absolute inset-0 bg-cover bg-center"
                                                        style={{ backgroundImage: `url('${entry.thumbnailUrl || entry.mediaUrl}')` }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                                                                <Play className="w-5 h-5 text-[#0B242A] ml-0.5" fill="currentColor" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-3 left-3">
                                                        <span className="px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-xs text-white font-medium">
                                                            {textData.timeline.video}
                                                        </span>
                                                    </div>
                                                </button>
                                            ) : null}
                                        </div>
                                    )}

                                    {/* Description & Actions */}
                                    <div className="p-4 pt-3">
                                        {entry.description && (
                                            <div className="mb-3">
                                                <p className={`text-sm text-gray-600 leading-relaxed ${!isExpanded && 'line-clamp-2'}`}>
                                                    {entry.description}
                                                </p>
                                                {entry.description.length > 100 && (
                                                    <button
                                                        onClick={() => toggleExpand(entry.id)}
                                                        className="text-sm text-[#0d8bf2] hover:text-[#0a7ad9] font-medium mt-1 flex items-center gap-1"
                                                    >
                                                        {isExpanded ? textData.timeline.showLess : textData.timeline.showMore}
                                                        <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => toggleLike(entry.id)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                        isLiked 
                                                            ? 'bg-red-50 text-red-600' 
                                                            : 'hover:bg-gray-100 text-gray-500'
                                                    }`}
                                                >
                                                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                                    <span className="hidden sm:inline">
                                                        {isLiked ? textData.timeline.liked : textData.timeline.like}
                                                    </span>
                                                </button>
                                                <button 
                                                    onClick={() => handleShare(entry)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                    <span className="hidden sm:inline">{textData.timeline.share}</span>
                                                </button>
                                            </div>
                                            {entry.mediaUrl && (
                                                <button 
                                                    onClick={() => handleDownload(entry.mediaUrl!, `${entry.title}.${entry.type === 'image' ? 'jpg' : 'mp4'}`)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span className="hidden sm:inline">{textData.timeline.download}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* End indicator */}
                {entries.length > 0 && (
                    <div className="flex items-center gap-3 md:gap-4 px-4 md:px-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 rotate-90" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#0B242A]">
                                {textData.timeline.showingEntries(entries.length, entries.length)}
                            </p>
                            <p className="text-xs text-gray-400">
                                {textData.timeline.loadFullHistory}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Timeline;
