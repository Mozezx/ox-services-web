import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Timeline from '../components/timeline/Timeline';
import CommentSection from '../components/comments/CommentSection';
import { useLanguage } from '../context/LanguageContext';
import { useWork, WorkStats } from '../hooks/works/useWork';
import { 
    Calendar, 
    User, 
    Clock, 
    TrendingUp, 
    Share2, 
    Copy, 
    MapPin, 
    HardHat,
    Camera,
    Video,
    FileText,
    CheckCircle2,
    Timer,
    CalendarDays,
    ExternalLink,
    MessageCircle,
    ChevronDown,
    Wifi,
    WifiOff
} from 'lucide-react';

// Hook para detectar status offline
const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    
    return isOnline;
};

// Componente de Indicador Offline
const OfflineIndicator: React.FC<{ isOnline: boolean; texts: { youAreOffline: string; dataOutdated: string } }> = ({ isOnline, texts }) => {
    if (isOnline) return null;
    
    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50 animate-slide-up">
            <div className="flex items-center gap-3 bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg">
                <WifiOff className="w-5 h-5 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-sm">{texts.youAreOffline}</p>
                    <p className="text-xs text-white/80">{texts.dataOutdated}</p>
                </div>
            </div>
        </div>
    );
};

// Componente de Card de Estatística
interface StatCardProps {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    color?: 'blue' | 'green' | 'amber' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
    };
    
    return (
        <div className={`flex flex-col items-center p-4 rounded-xl border ${colorClasses[color]} transition-all hover:scale-105`}>
            <div className="mb-2">{icon}</div>
            <span className="text-2xl font-bold text-[#0B242A]">{value}</span>
            <span className="text-xs text-[#0B242A]/60 text-center">{label}</span>
        </div>
    );
};

const WorkPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const { textData, language } = useLanguage();
    const { data, isLoading, error } = useWork(token || '');
    const [copied, setCopied] = useState(false);
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const isOnline = useOnlineStatus();

    useEffect(() => {
        document.body.classList.add('ox-bg-light', 'ox-font-body');
        return () => {
            document.body.classList.remove('ox-bg-light', 'ox-font-body');
        };
    }, []);

    // Gera URL da obra - em produção usa domínio fixo
    const getWorkUrl = () => {
        if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
            return `https://oxservices.org/obra/${token}`;
        }
        return `${window.location.origin}/obra/${token}`;
    };

    const handleCopyLink = async () => {
        const url = getWorkUrl();
        
        // Tenta usar a Clipboard API moderna primeiro
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                return;
            } catch (err) {
                // Fallback se a Clipboard API falhar
            }
        }
        
        // Fallback para contextos não-seguros (HTTP, IP local, mobile)
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Falha silenciosa
        }
        
        document.body.removeChild(textArea);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(
            language === 'en' ? 'en-GB' :
            language === 'nl' ? 'nl-NL' :
            language === 'es' ? 'es-ES' : 'fr-FR',
            { day: '2-digit', month: 'short', year: 'numeric' }
        );
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            planned: { label: textData.workpage.statusLabels.planned, color: 'bg-amber-100 text-amber-700 border-amber-200' },
            in_progress: { label: textData.workpage.statusLabels.in_progress, color: 'bg-blue-100 text-blue-700 border-blue-200' },
            completed: { label: textData.workpage.statusLabels.completed, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
        };
        return badges[status as keyof typeof badges] || badges.planned;
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6f7f8] to-[#e9ecef] flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-[#0B242A]/10 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#0d8bf2] border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <HardHat className="w-10 h-10 text-[#0d8bf2]" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-[#0B242A] mb-2">{textData.workpage.loading}</h2>
                    <p className="text-[#0B242A]/60">{textData.workpage.preparing}</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f6f7f8] to-[#e9ecef] flex items-center justify-center p-4">
                <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-xl">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#0B242A] mb-3">{textData.workpage.workNotFound}</h2>
                    <p className="text-[#0B242A]/60 mb-6">{textData.workpage.workNotFoundDescription}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="/"
                            className="px-6 py-3 bg-[#0d8bf2] hover:bg-[#0a7ad9] text-white font-semibold rounded-xl transition-all hover:shadow-lg"
                        >
                            {textData.workpage.backToHome}
                        </a>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#0B242A] font-medium rounded-xl transition-colors"
                        >
                            {textData.workpage.tryAgain}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { work, timeline, comments, stats: rawStats } = data;
    
    // Fallback para stats quando não vier da API
    const stats: WorkStats = rawStats || {
        progress: 0,
        daysWorked: 0,
        daysRemaining: 0,
        totalDays: 0,
        photosCount: timeline?.filter(e => e.type === 'image').length || 0,
        videosCount: timeline?.filter(e => e.type === 'video').length || 0,
        notesCount: timeline?.filter(e => e.type === 'note').length || 0,
        totalEntries: timeline?.length || 0,
        commentsCount: comments?.length || 0,
        lastUpdate: work?.startDate || new Date().toISOString(),
    };
    
    const statusBadge = getStatusBadge(work.status);

    return (
        <div className="min-h-screen bg-[#f6f7f8]">
            {/* Header/Navbar */}
            <Header
                companyName={textData.companyName}
                navLinks={textData.navigation}
                ctaButtonText={textData.ctaButton}
            />

            {/* Hero Section - Redesenhada */}
            <section className="relative overflow-hidden bg-[#0B242A]">
                {/* Background Image com Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${work.coverImageUrl}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0B242A]/80 via-[#0B242A]/90 to-[#0B242A]" />
                
                {/* Conteúdo do Hero */}
                <div className="relative container mx-auto px-4 py-8 md:py-12 lg:py-16">
                    {/* Breadcrumb / Tag */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-6 bg-[#0d8bf2] rounded-full" />
                        <span className="text-[#0d8bf2] font-semibold text-sm tracking-wider uppercase">
                            {textData.workpage.progressTitle}
                        </span>
                        {!isOnline && (
                            <span className="flex items-center gap-1 text-amber-400 text-xs ml-2">
                                <WifiOff className="w-3 h-3" />
                                Offline
                            </span>
                        )}
                    </div>
                    
                    {/* Título e Status */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                                {work.name}
                            </h1>
                            <p className="text-white/70 text-base md:text-lg max-w-2xl leading-relaxed">
                                {work.description}
                            </p>
                        </div>
                        
                        {/* Badge de Status */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusBadge.color} self-start`}>
                            {work.status === 'completed' ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : work.status === 'in_progress' ? (
                                <Timer className="w-4 h-4" />
                            ) : (
                                <CalendarDays className="w-4 h-4" />
                            )}
                            <span className="font-semibold text-sm">{statusBadge.label}</span>
                        </div>
                    </div>
                    
                    {/* Info Pills */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                            <User className="w-4 h-4 text-white/60" />
                            <span className="text-white/90 text-sm font-medium">{work.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                            <Calendar className="w-4 h-4 text-white/60" />
                            <span className="text-white/90 text-sm font-medium">
                                {formatDate(work.startDate)} - {formatDate(work.endDate)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                            <Clock className="w-4 h-4 text-white/60" />
                            <span className="text-white/90 text-sm font-medium">
                                {stats.totalDays} {textData.workpage.totalDays || 'dias totais'}
                            </span>
                        </div>
                    </div>
                    
                    {/* Stats Card - Elevado */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl -mb-16 relative z-10">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                icon={<Timer className="w-6 h-6" />}
                                value={stats.daysWorked}
                                label={textData.workpage.daysWorked}
                                color="blue"
                            />
                            <StatCard
                                icon={<Camera className="w-6 h-6" />}
                                value={stats.photosCount}
                                label={textData.workpage.photosRecorded}
                                color="green"
                            />
                            <StatCard
                                icon={<Video className="w-6 h-6" />}
                                value={stats.videosCount}
                                label={textData.workpage.videos}
                                color="purple"
                            />
                            <StatCard
                                icon={<CalendarDays className="w-6 h-6" />}
                                value={stats.daysRemaining}
                                label={textData.workpage.daysRemaining}
                                color="amber"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-0 md:px-4 pt-16 md:pt-20 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna Principal - Timeline */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Timeline Section */}
                        <section className="bg-white md:rounded-2xl rounded-none px-4 py-4 md:p-6 shadow-sm border-y md:border border-gray-100 mx-0">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-[#0d8bf2] rounded-full" />
                                    <h2 className="text-xl font-bold text-[#0B242A]">
                                        {textData.workpage.timelineTitle}
                                    </h2>
                                    <span className="bg-[#0d8bf2]/10 text-[#0d8bf2] px-3 py-1 rounded-full text-sm font-semibold">
                                        {textData.workpage.records(stats.totalEntries)}
                                    </span>
                                </div>
                            </div>
                            <Timeline entries={timeline} />
                        </section>

                        {/* Comments Section */}
                        <section className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mx-4 md:mx-0">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-1 h-6 bg-[#0d8bf2] rounded-full" />
                                <h2 className="text-xl font-bold text-[#0B242A]">
                                    {textData.workpage.commentsTitle}
                                </h2>
                                <span className="bg-[#0d8bf2]/10 text-[#0d8bf2] px-3 py-1 rounded-full text-sm font-semibold">
                                    {stats.commentsCount}
                                </span>
                            </div>
                            <CommentSection comments={comments} workToken={token || ''} />
                        </section>
                    </div>

                    {/* Sidebar - Informações e Compartilhamento */}
                    <div className="space-y-6 px-4 md:px-0">
                        {/* Card de Informações */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-5">
                                <MapPin className="w-5 h-5 text-[#0d8bf2]" />
                                <h3 className="text-lg font-bold text-[#0B242A]">
                                    {textData.workpage.infoTitle}
                                </h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-[#0B242A]/60 text-sm">{textData.workpage.accessToken}</span>
                                    <code className="bg-gray-50 text-[#0B242A] px-3 py-1 rounded-lg text-xs font-mono border border-gray-100">
                                        {token?.slice(0, 8)}...
                                    </code>
                                </div>
                                
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-[#0B242A]/60 text-sm">{textData.workpage.startDate}</span>
                                    <span className="font-semibold text-[#0B242A] text-sm">{formatDate(work.startDate)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-[#0B242A]/60 text-sm">{textData.workpage.endDate}</span>
                                    <span className="font-semibold text-[#0B242A] text-sm">{formatDate(work.endDate)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-[#0B242A]/60 text-sm">{textData.workpage.lastUpdate}</span>
                                    <span className="font-semibold text-[#0d8bf2] text-sm">{formatDate(stats.lastUpdate)}</span>
                                </div>
                                
                                {/* Expandable Info */}
                                <button 
                                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                                    className="flex items-center justify-between w-full py-2 text-[#0d8bf2] hover:text-[#0a7ad9] transition-colors"
                                >
                                    <span className="text-sm font-medium">
                                        {showMoreInfo ? textData.workpage.lessDetails : textData.workpage.moreDetails}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showMoreInfo ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {showMoreInfo && (
                                    <div className="space-y-3 pt-2 animate-fade-in">
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-[#0B242A]/60 text-sm">{textData.workpage.totalPhotos}</span>
                                            <span className="font-semibold text-[#0B242A] text-sm">{stats.photosCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-[#0B242A]/60 text-sm">{textData.workpage.totalVideos}</span>
                                            <span className="font-semibold text-[#0B242A] text-sm">{stats.videosCount}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-[#0B242A]/60 text-sm">{textData.workpage.totalNotes}</span>
                                            <span className="font-semibold text-[#0B242A] text-sm">{stats.notesCount}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card de Compartilhamento */}
                        <div className="bg-gradient-to-br from-[#0B242A] to-[#0f353d] rounded-2xl p-6 shadow-sm text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <Share2 className="w-5 h-5 text-[#0d8bf2]" />
                                <h3 className="text-lg font-bold">{textData.workpage.shareTitle}</h3>
                            </div>
                            
                            <p className="text-white/70 text-sm mb-4">
                                {textData.workpage.shareDescription}
                            </p>
                            
                            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl mb-4 border border-white/10">
                                <code className="text-xs text-white/90 break-all font-mono">
                                    {getWorkUrl()}
                                </code>
                            </div>
                            
                            <button
                                onClick={handleCopyLink}
                                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${
                                    copied 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-[#0d8bf2] hover:bg-[#0a7ad9] text-white hover:shadow-lg'
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        {textData.workpage.linkCopied}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5" />
                                        {textData.workpage.copyLink}
                                    </>
                                )}
                            </button>
                            
                            {/* WhatsApp Share */}
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(`${textData.workpage.followWorkProgress} ${getWorkUrl()}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white mt-3 transition-all hover:shadow-lg"
                            >
                                <MessageCircle className="w-5 h-5" />
                                {textData.workpage.shareOnWhatsApp}
                            </a>
                        </div>

                        {/* PWA Install Prompt (Opcional) */}
                        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <ExternalLink className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[#0B242A] mb-1">{textData.workpage.installApp}</h4>
                                    <p className="text-xs text-[#0B242A]/60">
                                        {textData.workpage.installAppDescription}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Offline Indicator */}
            <OfflineIndicator isOnline={isOnline} texts={{ youAreOffline: textData.workpage.youAreOffline, dataOutdated: textData.workpage.dataOutdated }} />
        </div>
    );
};

export default WorkPage;
