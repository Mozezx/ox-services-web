import React, { useState } from 'react';
import { MessageCircle, Send, User, Calendar, ThumbsUp, Reply, MoreVertical, CheckCircle, Clock, Filter, ChevronDown, Heart, Share2, Flag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import '../../src/styles/workpage-theme.css';

export interface Comment {
    id: string;
    authorName: string;
    authorEmail?: string;
    content: string;
    createdAt: string;
    approved?: boolean;
    likes?: number;
    replies?: Comment[];
}

interface CommentSectionProps {
    comments: Comment[];
    workToken: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, workToken }) => {
    const { textData, language } = useLanguage();
    const [newComment, setNewComment] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [authorEmail, setAuthorEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'oldest'>('recent');
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
    const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !authorName.trim()) return;

        setIsSubmitting(true);
        
        // Simulação de envio para API
        setTimeout(() => {
            console.log('Enviando comentário:', {
                workToken,
                authorName,
                authorEmail,
                content: newComment
            });
            
            // Limpar formulário
            setNewComment('');
            setAuthorName('');
            setAuthorEmail('');
            setIsSubmitting(false);
            
            // Feedback visual
            const submitBtn = document.getElementById('submit-comment');
            if (submitBtn) {
                submitBtn.innerHTML = '✓ Enviado!';
                submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                setTimeout(() => {
                    submitBtn.innerHTML = '<Send className="w-4 h-4 mr-2" /> Enviar Comentário';
                    submitBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                }, 2000);
            }
        }, 1500);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 60) return textData.comments.minutesAgo(diffMins);
        if (diffHours < 24) return textData.comments.hoursAgo(diffHours);
        if (diffDays === 1) return textData.comments.yesterday;
        if (diffDays < 7) return textData.comments.daysAgo(diffDays);
        
        return date.toLocaleDateString(language === 'en' ? 'en-GB' :
                                      language === 'nl' ? 'nl-NL' :
                                      language === 'es' ? 'es-ES' :
                                      'fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const toggleReply = (commentId: string) => {
        const newExpanded = new Set(expandedReplies);
        if (newExpanded.has(commentId)) {
            newExpanded.delete(commentId);
        } else {
            newExpanded.add(commentId);
        }
        setExpandedReplies(newExpanded);
    };

    const toggleLike = (commentId: string) => {
        const newLiked = new Set(likedComments);
        if (newLiked.has(commentId)) {
            newLiked.delete(commentId);
        } else {
            newLiked.add(commentId);
        }
        setLikedComments(newLiked);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRandomColor = (str: string) => {
        const colors = [
            'from-[#0B242A] to-[#0B242A]/80',
            'from-[#0d8bf2] to-[#0057ac]',
            'from-[#0B242A]/80 to-[#0B242A]/60',
            'from-[#0d8bf2]/80 to-[#0057ac]/80',
            'from-[#0B242A]/60 to-[#0B242A]/40'
        ];
        const index = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        return colors[index];
    };

    const sortedComments = [...comments].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        
        switch (sortBy) {
            case 'recent':
                return dateB - dateA;
            case 'oldest':
                return dateA - dateB;
            case 'popular':
                return (b.likes || 0) - (a.likes || 0);
            default:
                return dateB - dateA;
        }
    });

    return (
        <div className="space-y-8">
            {/* Cabeçalho com filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d8bf2] to-[#0057ac] flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#0B242A] ox-font-display">
                            {textData.comments.title}
                        </h3>
                        <p className="text-[#0B242A]/60 text-sm">
                            {textData.comments.commentsCount(comments.length)} • {textData.comments.likesCount(comments.reduce((acc, c) => acc + (c.likes || 0), 0))}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#0B242A]/50" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="pl-10 pr-8 py-2 bg-[#0B242A]/5 border border-[#0B242A]/10 rounded-lg text-[#0B242A] font-medium text-sm focus:ring-2 focus:ring-[#0d8bf2] focus:border-[#0d8bf2] appearance-none"
                        >
                            <option value="recent">{textData.comments.sortRecent}</option>
                            <option value="popular">{textData.comments.sortPopular}</option>
                            <option value="oldest">{textData.comments.sortOldest}</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#0B242A]/50 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Formulário de novo comentário */}
            <div className="ox-card p-6 ox-animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-[#0d8bf2] rounded-full"></div>
                    <h4 className="text-lg font-bold text-[#0B242A] ox-font-display">
                        {textData.comments.addComment}
                    </h4>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-[#0B242A] mb-2">
                                {textData.comments.yourName}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#0B242A]/40" />
                                <input
                                    type="text"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[#0B242A]/5 border border-[#0B242A]/10 rounded-xl focus:ring-2 focus:ring-[#0d8bf2] focus:border-[#0d8bf2] transition-all placeholder-[#0B242A]/40"
                                    placeholder={textData.comments.yourName}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#0B242A] mb-2">
                                {textData.comments.yourEmail}
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#0B242A]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <input
                                    type="email"
                                    value={authorEmail}
                                    onChange={(e) => setAuthorEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[#0B242A]/5 border border-[#0B242A]/10 rounded-xl focus:ring-2 focus:ring-[#0d8bf2] focus:border-[#0d8bf2] transition-all placeholder-[#0B242A]/40"
                                    placeholder={textData.comments.yourEmail}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-[#0B242A] mb-2">
                            {textData.comments.yourComment}
                        </label>
                        <div className="relative">
                            <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-[#0B242A]/40" />
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows={4}
                                className="w-full pl-10 pr-4 py-3 bg-[#0B242A]/5 border border-[#0B242A]/10 rounded-xl focus:ring-2 focus:ring-[#0d8bf2] focus:border-[#0d8bf2] transition-all resize-none placeholder-[#0B242A]/40"
                                placeholder={textData.comments.yourComment}
                                required
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-[#0B242A]/40">
                                {newComment.length}/500
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#0B242A]/10">
                        <div className="flex items-center gap-2 text-[#0B242A]/60 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{textData.comments.approvalNote}</span>
                        </div>
                        <button
                            id="submit-comment"
                            type="submit"
                            disabled={isSubmitting || !newComment.trim() || !authorName.trim()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0d8bf2] to-[#0057ac] hover:from-[#0a7ad9] hover:to-[#004a99] disabled:from-[#0B242A]/20 disabled:to-[#0B242A]/30 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none min-w-[180px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    {textData.comments.submitting}
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    {textData.comments.submitComment}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Lista de comentários */}
            <div className="space-y-6">
                {sortedComments.length > 0 ? (
                    sortedComments.map((comment) => {
                        const isLiked = likedComments.has(comment.id);
                        const hasReplies = comment.replies && comment.replies.length > 0;
                        const isExpanded = expandedReplies.has(comment.id);
                        const avatarColor = getRandomColor(comment.authorName);

                        return (
                            <div
                                key={comment.id}
                                className="ox-card overflow-hidden ox-animate-fade-in"
                                style={{ animationDelay: `${sortedComments.indexOf(comment) * 50}ms` }}
                            >
                                <div className="p-5">
                                    {/* Cabeçalho do comentário */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${avatarColor}`}>
                                                {getInitials(comment.authorName)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-[#0B242A]">
                                                        {comment.authorName}
                                                    </h4>
                                                    {comment.approved && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                                            <CheckCircle className="w-3 h-3" />
                                                            {textData.comments.verified}
                                                        </span>
                                                    )}
                                                    {comment.approved === false && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
                                                            <Clock className="w-3 h-3" />
                                                            {textData.comments.awaitingApproval}
                                                        </span>
                                                    )}
                                                </div>
                                                {comment.authorEmail && (
                                                    <p className="text-[#0B242A]/60 text-sm">{comment.authorEmail}</p>
                                                )}
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[#0B242A]/40 text-sm flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(comment.createdAt)}
                                                    </span>
                                                    <span className="text-[#0B242A]/40 text-sm">•</span>
                                                    <span className="text-[#0B242A]/40 text-sm">
                                                        {textData.comments.likesCount(comment.likes || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-2 hover:bg-[#0B242A]/5 rounded-lg transition-colors">
                                            <MoreVertical className="w-5 h-5 text-[#0B242A]/40" />
                                        </button>
                                    </div>

                                    {/* Conteúdo do comentário */}
                                    <p className="text-[#0B242A] mb-5 leading-relaxed">
                                        {comment.content}
                                    </p>

                                    {/* Ações do comentário */}
                                    <div className="flex items-center justify-between pt-4 border-t border-[#0B242A]/10">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => toggleLike(comment.id)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                                                    isLiked
                                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                                        : 'bg-[#0B242A]/5 text-[#0B242A] hover:bg-[#0B242A]/10'
                                                }`}
                                            >
                                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600' : ''}`} />
                                                <span className="font-medium hidden sm:inline">
                                                    {isLiked ? textData.comments.liked : textData.comments.like}
                                                </span>
                                            </button>
                                            
                                            <button
                                                onClick={() => toggleReply(comment.id)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-[#0B242A]/5 text-[#0B242A] hover:bg-[#0B242A]/10 rounded-lg transition-colors"
                                            >
                                                <Reply className="w-4 h-4" />
                                                <span className="font-medium hidden sm:inline">{textData.comments.reply}</span>
                                            </button>
                                            
                                            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#0B242A]/5 text-[#0B242A] hover:bg-[#0B242A]/10 rounded-lg transition-colors">
                                                <Share2 className="w-4 h-4" />
                                                <span className="font-medium hidden sm:inline">{textData.comments.share}</span>
                                            </button>
                                        </div>
                                        
                                        <button className="flex items-center gap-1 text-[#0B242A]/40 hover:text-[#0B242A]/60 text-sm">
                                            <Flag className="w-4 h-4" />
                                            <span className="hidden sm:inline">{textData.comments.report}</span>
                                        </button>
                                    </div>

                                    {/* Respostas */}
                                    {hasReplies && (
                                        <div className="mt-6">
                                            <button
                                                onClick={() => toggleReply(comment.id)}
                                                className="flex items-center gap-2 text-steel-600 hover:text-steel-700 font-medium mb-4"
                                            >
                                                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                <span>
                                                    {textData.comments.replies(comment.replies!.length)}
                                                </span>
                                            </button>
                                            
                                            {isExpanded && comment.replies && (
                                                <div className="ml-8 pl-6 border-l-2 border-[#0B242A]/20 space-y-4">
                                                    {comment.replies.map((reply) => (
                                                        <div key={reply.id} className="pt-4 first:pt-0">
                                                            <div className="flex items-start gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getRandomColor(reply.authorName)}`}>
                                                                    {getInitials(reply.authorName)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-medium text-[#0B242A]">{reply.authorName}</span>
                                                                        <span className="text-[#0B242A]/40 text-xs">{formatDate(reply.createdAt)}</span>
                                                                    </div>
                                                                    <p className="text-[#0B242A]/70 text-sm">{reply.content}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="ox-card p-8 text-center ox-animate-fade-in">
                        <div className="inline-flex flex-col items-center max-w-md mx-auto">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0B242A]/10 to-[#0B242A]/20 flex items-center justify-center mb-6">
                                <MessageCircle className="w-10 h-10 text-[#0B242A]/40" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#0B242A] mb-3 ox-font-display">
                                {textData.comments.noComments}
                            </h3>
                            <p className="text-[#0B242A]/60 mb-6">
                                {textData.comments.noCommentsDescription}
                            </p>
                            <div className="w-24 h-1 bg-gradient-to-r from-[#0B242A]/20 to-[#0B242A]/10 rounded-full"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Paginação */}
            {sortedComments.length > 5 && (
                <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2 bg-[#0B242A]/5 p-2 rounded-xl">
                        <button className="px-4 py-2 rounded-lg bg-white text-[#0B242A] font-medium shadow-sm border border-[#0B242A]/10 hover:bg-[#0B242A]/5 transition-colors">
                            Previous
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#0d8bf2] to-[#0057ac] text-white font-medium shadow-sm">
                            1
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-white text-[#0B242A] font-medium shadow-sm border border-[#0B242A]/10 hover:bg-[#0B242A]/5 transition-colors">
                            2
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-white text-[#0B242A] font-medium shadow-sm border border-[#0B242A]/10 hover:bg-[#0B242A]/5 transition-colors">
                            3
                        </button>
                        <span className="px-2 text-[#0B242A]/40">...</span>
                        <button className="px-4 py-2 rounded-lg bg-white text-[#0B242A] font-medium shadow-sm border border-[#0B242A]/10 hover:bg-[#0B242A]/5 transition-colors">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentSection;