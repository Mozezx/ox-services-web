import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Timeline from '../components/timeline/Timeline';
import CommentSection from '../components/comments/CommentSection';
import { useLanguage } from '../context/LanguageContext';
import { useWork } from '../hooks/works/useWork';
import { Calendar, User, Clock, TrendingUp, Share2, Copy, MapPin, HardHat } from 'lucide-react';

const WorkPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const { textData, language } = useLanguage();
    const { data, isLoading, error } = useWork(token || '');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Adicionar classe de tema ao body
        document.body.classList.add('ox-bg-light', 'ox-font-body');
        
        // Remover ao desmontar
        return () => {
            document.body.classList.remove('ox-bg-light', 'ox-font-body');
        };
    }, []);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/obra/${token}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen ox-bg-light flex items-center justify-center p-4">
                <div className="text-center ox-animate-fade-in">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-[#0B242A]/20 rounded-full"></div>
                        <div className="absolute inset-0 w-20 h-20 border-4 border-[#0d8bf2] border-t-transparent rounded-full animate-spin"></div>
                        <HardHat className="absolute inset-0 m-auto w-8 h-8 text-[#0d8bf2]" />
                    </div>
                    <p className="mt-6 text-[#0B242A] text-lg font-medium ox-font-body">{textData.workpage.loading}</p>
                    <p className="mt-2 text-[#0B242A]/60 text-sm">{textData.workpage.preparing}</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen ox-bg-light flex items-center justify-center p-4">
                <div className="text-center max-w-md ox-animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0B242A]/10 text-[#0B242A] mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[#0B242A] mb-2 ox-font-display">{textData.workpage.workNotFound}</h2>
                    <p className="text-[#0B242A]/70 mb-8 ox-font-body">
                        {textData.workpage.workNotFoundDescription}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="/"
                            className="px-6 py-3 bg-[#0d8bf2] hover:bg-[#0a7ad9] text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            {textData.workpage.backToHome}
                        </a>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-[#0B242A]/10 hover:bg-[#0B242A]/20 text-[#0B242A] font-medium rounded-lg transition-colors duration-300"
                        >
                            {textData.workpage.tryAgain}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { work, timeline, comments } = data;
    const progress = 65; // Mock - em produção viria da API

    return (
        <div className="min-h-screen ox-bg-light" role="main">
            {/* Header/Navbar */}
            <Header
                companyName={textData.companyName}
                navLinks={textData.navigation}
                ctaButtonText={textData.ctaButton}
            />

            {/* Hero Section Compacta */}
            <section
                className="relative overflow-hidden ox-bg-primary"
                aria-label="Informações principais da obra"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                    style={{
                        backgroundImage: `url('${work.coverImageUrl}')`,
                    }}
                    aria-hidden="true"
                ></div>
                
                <div className="relative container mx-auto px-4 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div className="max-w-4xl ox-animate-slide-up">
                            <div className="inline-flex items-center gap-2 mb-4">
                                <div className="w-2 h-6 bg-[#0d8bf2] rounded-full" aria-hidden="true"></div>
                                <span className="text-[#0d8bf2] font-semibold tracking-wider uppercase text-sm">{textData.workpage.progressTitle}</span>
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 ox-font-display leading-tight">
                                {work.name}
                            </h1>
                            
                            <p className="text-lg text-white/80 mb-8 max-w-3xl leading-relaxed ox-font-body">
                                {work.description}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mb-6" role="list" aria-label="Detalhes da obra">
                        <div
                            className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-white/20"
                            role="listitem"
                        >
                            <User className="w-4 h-4 text-white/80" aria-hidden="true" />
                            <div>
                                <div className="text-white/60 text-xs">{textData.workpage.client}</div>
                                <div className="text-white font-semibold text-sm">{work.clientName}</div>
                            </div>
                        </div>
                        
                        <div
                            className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-white/20"
                            role="listitem"
                        >
                            <Calendar className="w-4 h-4 text-white/80" aria-hidden="true" />
                            <div>
                                <div className="text-white/60 text-xs">{textData.workpage.status}</div>
                                <div className="text-white font-semibold text-sm capitalize">
                                    {work.status === 'in_progress' ? textData.workpage.statusLabels.in_progress :
                                     work.status === 'planned' ? textData.workpage.statusLabels.planned :
                                     textData.workpage.statusLabels.completed}
                                </div>
                            </div>
                        </div>
                        
                        <div
                            className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-white/20"
                            role="listitem"
                        >
                            <Clock className="w-4 h-4 text-white/80" aria-hidden="true" />
                            <div>
                                <div className="text-white/60 text-xs">{textData.workpage.period}</div>
                                <div className="text-white font-semibold text-sm">
                                    {new Date(work.startDate).toLocaleDateString(language === 'en' ? 'en-GB' :
                                                                                 language === 'nl' ? 'nl-NL' :
                                                                                 language === 'es' ? 'es-ES' :
                                                                                 'fr-FR')} - {new Date(work.endDate).toLocaleDateString(language === 'en' ? 'en-GB' :
                                                                                 language === 'nl' ? 'nl-NL' :
                                                                                 language === 'es' ? 'es-ES' :
                                                                                 'fr-FR')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content - Stack Vertical */}
            <div className="container mx-auto px-4 py-6 md:py-8">
                <div className="flex flex-col gap-6">
                    {/* Progresso da obra */}
                    <section
                        className="ox-card p-5 ox-animate-fade-in"
                        style={{ animationDelay: '100ms' }}
                        aria-labelledby="progresso-title"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 id="progresso-title" className="text-xl font-bold text-[#0B242A] ox-font-display">
                                {textData.workpage.progressTitle}
                            </h2>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#0d8bf2]" aria-hidden="true" />
                                <span className="text-[#0d8bf2] font-bold text-xl">{progress}%</span>
                            </div>
                        </div>
                        
                        <div
                            className="ox-progress mb-4"
                            role="progressbar"
                            aria-valuenow={progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-label={`Progresso da obra: ${progress}%`}
                        >
                            <div
                                className="ox-progress-fill"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        
                        <div className="flex justify-between text-sm text-[#0B242A]/60 mb-6">
                            <span>{textData.workpage.startDate}</span>
                            <span>{textData.workpage.endDate}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="list" aria-label="Estatísticas da obra">
                            <div className="text-center p-3 bg-[#0B242A]/5 rounded-lg" role="listitem">
                                <div className="text-2xl font-bold text-[#0B242A]">42</div>
                                <div className="text-[#0B242A]/60 text-sm">{textData.workpage.daysWorked}</div>
                            </div>
                            <div className="text-center p-3 bg-[#0B242A]/5 rounded-lg" role="listitem">
                                <div className="text-2xl font-bold text-[#0B242A]">18</div>
                                <div className="text-[#0B242A]/60 text-sm">{textData.workpage.photosRecorded}</div>
                            </div>
                            <div className="text-center p-3 bg-[#0B242A]/5 rounded-lg" role="listitem">
                                <div className="text-2xl font-bold text-[#0B242A]">7</div>
                                <div className="text-[#0B242A]/60 text-sm">{textData.workpage.videos}</div>
                            </div>
                            <div className="text-center p-3 bg-[#0B242A]/5 rounded-lg" role="listitem">
                                <div className="text-2xl font-bold text-[#0B242A]">23</div>
                                <div className="text-[#0B242A]/60 text-sm">{textData.workpage.daysRemaining}</div>
                            </div>
                        </div>
                    </section>

                    {/* Timeline Section */}
                    <section
                        className="ox-card p-5 ox-animate-fade-in"
                        style={{ animationDelay: '200ms' }}
                        aria-labelledby="timeline-title"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-6 bg-[#0d8bf2] rounded-full" aria-hidden="true"></div>
                            <h2 id="timeline-title" className="text-xl font-bold text-[#0B242A] ox-font-display">
                                {textData.workpage.timelineTitle}
                            </h2>
                            <span className="ox-badge ox-badge-accent">{textData.workpage.records(timeline.length)}</span>
                        </div>
                        <Timeline entries={timeline} />
                    </section>

                    {/* Informações da Obra */}
                    <div className="ox-card p-5 ox-animate-fade-in" style={{ animationDelay: '150ms' }}>
                        <div className="flex items-center gap-3 mb-5">
                            <MapPin className="w-5 h-5 text-[#0d8bf2]" />
                            <h3 className="text-lg font-bold text-[#0B242A] ox-font-display">
                                {textData.workpage.infoTitle}
                            </h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-[#0B242A]/10">
                                <span className="text-[#0B242A]/70 text-sm">{textData.workpage.accessToken}</span>
                                <code className="font-mono text-xs bg-[#0B242A]/5 text-[#0B242A] px-3 py-1.5 rounded-lg border border-[#0B242A]/10">
                                    {token}
                                </code>
                            </div>
                            
                            <div className="flex justify-between items-center pb-3 border-b border-[#0B242A]/10">
                                <span className="text-[#0B242A]/70 text-sm">{textData.workpage.startDate}</span>
                                <span className="font-semibold text-[#0B242A] text-sm">
                                    {new Date(work.startDate).toLocaleDateString(language === 'en' ? 'en-GB' :
                                                                                 language === 'nl' ? 'nl-NL' :
                                                                                 language === 'es' ? 'es-ES' :
                                                                                 'fr-FR')}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center pb-3 border-b border-[#0B242A]/10">
                                <span className="text-[#0B242A]/70 text-sm">{textData.workpage.endDate}</span>
                                <span className="font-semibold text-[#0B242A] text-sm">
                                    {new Date(work.endDate).toLocaleDateString(language === 'en' ? 'en-GB' :
                                                                                 language === 'nl' ? 'nl-NL' :
                                                                                 language === 'es' ? 'es-ES' :
                                                                                 'fr-FR')}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-[#0B242A]/70 text-sm">{textData.workpage.lastUpdate}</span>
                                <span className="font-semibold text-[#0d8bf2] text-sm">{textData.workpage.today}</span>
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-5 border-t border-[#0B242A]/10">
                            <div className="text-[#0B242A]/70 text-sm mb-3">{textData.workpage.teamResponsible}</div>
                            <div className="flex -space-x-2">
                                {['JS', 'MR', 'AS', 'LP'].map((initials, idx) => (
                                    <div 
                                        key={idx}
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0d8bf2] to-[#0057ac] flex items-center justify-center text-white font-bold text-xs border-2 border-white"
                                    >
                                        {initials}
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full bg-[#0B242A]/10 flex items-center justify-center text-[#0B242A] font-bold text-xs border-2 border-white">
                                    +3
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compartilhar Acesso */}
                    <div className="ox-card p-5 ox-animate-fade-in" style={{ animationDelay: '250ms' }}>
                        <div className="flex items-center gap-3 mb-5">
                            <Share2 className="w-5 h-5 text-[#0d8bf2]" />
                            <h3 className="text-lg font-bold text-[#0B242A] ox-font-display">
                                {textData.workpage.shareTitle}
                            </h3>
                        </div>
                        
                        <p className="text-[#0B242A]/70 text-sm mb-4">
                            {textData.workpage.shareDescription}
                        </p>
                        
                        <div className="bg-[#0B242A]/5 p-4 rounded-lg border border-[#0B242A]/10 mb-5">
                            <code className="text-sm text-[#0B242A] break-all font-mono">
                                {window.location.origin}/obra/{token}
                            </code>
                        </div>
                        
                        <button
                            onClick={handleCopyLink}
                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-lg transition-all duration-300 ${
                                copied 
                                    ? 'bg-green-100 text-green-700 border border-green-200' 
                                    : 'bg-[#0d8bf2] hover:bg-[#0a7ad9] text-white hover:shadow-lg hover:-translate-y-0.5'
                            }`}
                        >
                            {copied ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {textData.workpage.linkCopied}
                                </>
                            ) : (
                                <>
                                    <Copy className="w-5 h-5" />
                                    {textData.workpage.copyLink}
                                </>
                            )}
                        </button>
                        
                        <div className="mt-6 pt-5 border-t border-[#0B242A]/10">
                            <p className="text-[#0B242A]/70 text-sm">
                                {textData.workpage.shareDescription}
                            </p>
                        </div>
                    </div>

                    {/* Seção de Comentários */}
                    <section
                        className="ox-card p-5 ox-animate-fade-in"
                        style={{ animationDelay: '300ms' }}
                        aria-labelledby="comentarios-title"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-6 bg-[#0d8bf2] rounded-full" aria-hidden="true"></div>
                            <h2 id="comentarios-title" className="text-xl font-bold text-[#0B242A] ox-font-display">
                                {textData.workpage.commentsTitle}
                            </h2>
                            <span className="ox-badge ox-badge-accent">{textData.workpage.commentsCount(comments.length)}</span>
                        </div>
                        <CommentSection comments={comments} workToken={token || ''} />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default WorkPage;
