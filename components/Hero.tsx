
import React from 'react';

interface HeroProps {
    content: {
        preHeading: string;
        heading: string;
        subHeading: string;
        primaryAction: string;
        secondaryAction: string;
        backgroundImageAlt: string;
    };
}

const Hero: React.FC<HeroProps> = ({ content }) => {
    return (
        <section className="w-full flex justify-center py-5 px-4 md:px-10">
            <div className="w-full max-w-[1280px]">
                <div
                    className="relative overflow-hidden rounded-xl bg-primary min-h-[600px] flex flex-col justify-end p-8 md:p-16 bg-cover bg-center"
                    style={{ backgroundImage: `linear-gradient(rgba(11, 36, 42, 0.3) 0%, rgba(11, 36, 42, 0.8) 100%), url('/hero-background-new.png')` }}
                    role="banner"
                    aria-label={content.backgroundImageAlt}
                >
                    <div className="max-w-[720px] flex flex-col gap-6">
                        <div className="flex items-center gap-2 text-white/90">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            <span className="text-xs md:text-sm font-bold tracking-wider uppercase">{content.preHeading}</span>
                        </div>
                        <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold font-display leading-tight tracking-tighter">
                            {content.heading}
                        </h1>
                        <p className="text-white/90 text-base md:text-xl font-normal font-body leading-relaxed max-w-[600px]">
                            {content.subHeading}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-4">
                            <a href="#contact" className="flex h-12 px-8 items-center justify-center rounded-lg bg-white text-primary hover:bg-gray-100 text-base font-bold transition-colors" aria-label="Get a free quote for your project">
                                {content.primaryAction}
                            </a>
                            <a href="#portfolio" className="flex h-12 px-8 items-center justify-center rounded-lg border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 text-base font-bold transition-colors" aria-label="View our completed projects">
                                {content.secondaryAction}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
