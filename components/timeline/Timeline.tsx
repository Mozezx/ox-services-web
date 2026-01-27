import React, { useState } from 'react';
import { Calendar, Image, Video, FileText, ChevronRight, ZoomIn, Play, Download, Share2, Heart, MoreVertical, MessageCircle, User } from 'lucide-react';
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

const Timeline: React.FC<TimelineProps> = ({ entries }) => {
    const { textData, language } = useLanguage();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [likedEntries, setLikedEntries] = useState<Set<string>>(new Set());

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
                    bg: 'bg-[#0d8bf2]',
                    text: 'text-[#0d8bf2]',
                    light: 'bg-[#0d8bf2]/10',
                    border: 'border-[#0d8bf2]/20'
                };
            case 'video':
                return {
                    bg: 'bg-[#c17d47]',
                    text: 'text-[#c17d47]',
                    light: 'bg-[#c17d47]/10',
                    border: 'border-[#c17d47]/20'
                };
            case 'note':
                return {
                    bg: 'bg-[#6c757d]',
                    text: 'text-[#6c757d]',
                    light: 'bg-[#6c757d]/10',
                    border: 'border-[#6c757d]/20'
                };
            default:
                return {
                    bg: 'bg-[#0B242A]',
                    text: 'text-[#0B242A]',
                    light: 'bg-[#0B242A]/10',
                    border: 'border-[#0B242A]/20'
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

    const toggleLike = (id: string) => {
        const newLiked = new Set(likedEntries);
        if (newLiked.has(id)) {
            newLiked.delete(id);
        } else {
            newLiked.add(id);
        }
        setLikedEntries(newLiked);
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (entries.length === 0) {
        return (
            <div className="text-center py-12 ox-animate-fade-in">
                <div className="inline-flex flex-col items-center p-6 bg-[#0B242A]/5 rounded-xl border border-[#0B242A]/10 max-w-md">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0B242A]/10 to-[#0B242A]/20 flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-[#0B242A]/40" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0B242A] mb-2 ox-font-display">
                        {textData.timeline.emptyTitle}
                    </h3>
                    <p className="text-[#0B242A]/60 mb-4 ox-font-body">
                        {textData.timeline.emptyDescription}
                    </p>
                    <div className="w-20 h-1 bg-gradient-to-r from-[#0B242A]/10 to-[#0B242A]/5 rounded-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {entries.map((entry, index) => {
                const colors = getTypeColor(entry.type);
                const isExpanded = expandedId === entry.id;
                const isLiked = likedEntries.has(entry.id);

                return (
                    <div 
                        key={entry.id}
                        className="ox-timeline-entry ox-animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Avatar */}
                        <div className="ox-timeline-avatar">
                            <div className={`ox-avatar ox-avatar-sm ${colors.bg}`}>
                                {getIcon(entry.type)}
                            </div>
                            <div className="ox-timeline-connector"></div>
                        </div>

                        {/* Content Card */}
                        <div className="ox-timeline-content">
                            <div className="ox-card p-4">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-[#0B242A]">João Silva</span>
                                            <span className="text-xs text-[#0B242A]/40">•</span>
                                            <span className="text-xs text-[#0B242A]/60">{formatDate(entry.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.light} ${colors.text}`}>
                                                {getTypeLabel(entry.type)}
                                            </span>
                                            <span className="text-xs text-[#0B242A]/40">#{String(index + 1).padStart(2, '0')}</span>
                                        </div>
                                    </div>
                                    <button className="p-1 hover:bg-[#0B242A]/5 rounded-lg transition-colors">
                                        <MoreVertical className="w-4 h-4 text-[#0B242A]/40" />
                                    </button>
                                </div>

                                {/* Title */}
                                <h4 className="text-base font-semibold text-[#0B242A] mb-2 ox-font-display">
                                    {entry.title}
                                </h4>

                                {/* Media */}
                                {entry.mediaUrl && (
                                    <div className="ox-timeline-media mb-3">
                                        {entry.type === 'image' ? (
                                            <div className="relative overflow-hidden rounded-lg bg-[#0B242A]/5">
                                                <img 
                                                    src={entry.mediaUrl} 
                                                    alt={entry.title}
                                                    className="w-full h-auto max-h-96 object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                                <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110">
                                                    <ZoomIn className="w-4 h-4 text-[#0B242A]" />
                                                </button>
                                            </div>
                                        ) : entry.type === 'video' ? (
                                            <div className="relative aspect-video bg-[#0B242A] overflow-hidden rounded-lg">
                                                <div 
                                                    className="absolute inset-0 bg-cover bg-center opacity-60"
                                                    style={{ backgroundImage: `url('${entry.thumbnailUrl || entry.mediaUrl}')` }}
                                                ></div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                                <button className="absolute inset-0 flex items-center justify-center group">
                                                    <div className="relative">
                                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300"></div>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Play className="w-8 h-8 text-white ml-1" />
                                                        </div>
                                                    </div>
                                                </button>
                                                <div className="absolute bottom-3 left-3">
                                                    <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs">
                                                        <span className="text-white font-medium">{textData.timeline.video} • 2:45</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )}

                                {/* Description */}
                                <div className="mb-3">
                                    <p className={`text-sm text-[#0B242A]/70 leading-relaxed ${!isExpanded && 'line-clamp-2'}`}>
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

                                {/* Actions */}
                                <div className="ox-timeline-actions">
                                    <button
                                        onClick={() => toggleLike(entry.id)}
                                        className="ox-timeline-action"
                                    >
                                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                        <span className="hidden sm:inline">{isLiked ? textData.timeline.liked : textData.timeline.like}</span>
                                    </button>
                                    <button className="ox-timeline-action">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="hidden sm:inline">{textData.timeline.comment}</span>
                                    </button>
                                    <button className="ox-timeline-action">
                                        <Share2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">{textData.timeline.share}</span>
                                    </button>
                                    {entry.mediaUrl && (
                                        <button className="ox-timeline-action ml-auto">
                                            <Download className="w-4 h-4" />
                                            <span className="hidden sm:inline">{textData.timeline.download}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Load more indicator */}
            {entries.length > 0 && (
                <div className="text-center pt-4 ox-animate-fade-in">
                    <div className="inline-flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d8bf2] to-[#0057ac] flex items-center justify-center mb-3 shadow-md">
                            <ChevronRight className="w-5 h-5 text-white rotate-90" />
                        </div>
                        <p className="text-[#0B242A]/60 mb-2 text-sm">
                            {textData.timeline.showingEntries(entries.length, entries.length)}
                        </p>
                        <button className="text-[#0d8bf2] hover:text-[#0a7ad9] font-semibold text-sm flex items-center gap-1 group">
                            <span>{textData.timeline.loadFullHistory}</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Timeline;