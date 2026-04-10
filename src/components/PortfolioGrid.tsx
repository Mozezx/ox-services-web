
import React, { useState, useEffect } from 'react';
import type { Project } from '../types';

interface PortfolioGridProps {
    content: {
        heading: string;
        subHeading: string;
        projects: Project[];
    };
}

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ content }) => {
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect if device is mobile
        const checkMobile = () => {
            setIsMobile(window.matchMedia('(max-width: 1024px)').matches);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <section className="w-full flex justify-center py-16 px-4 md:px-10 bg-white dark:bg-[#1a2629]">
            <div className="w-full max-w-[1280px]">
                <div className="text-center mb-12">
                    <h2 className="text-primary dark:text-white text-3xl md:text-4xl font-bold font-display leading-tight tracking-tight mb-3">{content.heading}</h2>
                    <p className="text-primary/70 dark:text-white/70 max-w-2xl mx-auto text-lg font-body">{content.subHeading}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[350px]">
                    {content.projects.map((project, index) => (
                        <div key={project.id} className={`group relative overflow-hidden rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 ${index === 0 ? 'md:col-span-2' : ''}`}>
                            {index === 0 && project.videoUrl && !isMobile ? (
                                <>
                                    {/* Always show poster image, hide it when video loads */}
                                    <img
                                        src={project.imageUrl}
                                        alt={project.altText}
                                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${videoLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                                    />
                                    {/* Video element - only on desktop */}
                                    <video
                                        src={project.videoUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        preload="auto"
                                        disablePictureInPicture
                                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                                        onLoadedData={() => setVideoLoaded(true)}
                                        onError={() => setVideoLoaded(false)}
                                    />
                                </>
                            ) : (
                                <img src={project.imageUrl} alt={project.altText} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                <span className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1 transition-transform duration-300 delay-75">{project.category}</span>
                                <h3 className="text-white text-xl font-bold font-display transition-transform duration-300 delay-100">{project.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PortfolioGrid;
