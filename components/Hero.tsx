
import React, { useState, useEffect } from 'react';

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
    const [currentSlide, setCurrentSlide] = useState(0);

    const mobileSlides = [
        '/hero-slide-1.png',
        '/hero-slide-2.png',
        '/hero-slide-3.png'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % mobileSlides.length);
        }, 4000); // Troca a cada 4 segundos

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="w-full flex justify-center py-5 px-4 md:px-10">
            <div className="w-full max-w-[1280px]">
                {/* Mobile: Slideshow */}
                <div
                    className="md:hidden relative overflow-hidden rounded-xl bg-primary min-h-[600px] flex flex-col justify-end p-8 bg-cover bg-center"
                    role="banner"
                    aria-label={content.backgroundImageAlt}
                >
                    {/* Slides */}
                    {mobileSlides.map((slide, index) => (
                        <div
                            key={slide}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                }`}
                            style={{
                                backgroundImage: `linear-gradient(rgba(11, 36, 42, 0.3) 0%, rgba(11, 36, 42, 0.8) 100%), url('${slide}')`
                            }}
                        />
                    ))}

                    {/* Conteúdo */}
                    <div className="relative z-10 max-w-[720px] flex flex-col gap-6">
                        <div className="flex items-center gap-2 text-white/90">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            <span className="text-xs font-bold tracking-wider uppercase">{content.preHeading}</span>
                        </div>
                        <h1 className="text-white text-4xl font-bold font-display leading-tight tracking-tighter">
                            {content.heading}
                        </h1>
                        <p className="text-white/90 text-base font-normal font-body leading-relaxed max-w-[600px]">
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

                    {/* Indicadores dos slides */}
                    <div className="relative z-10 flex justify-center gap-2 mt-6">
                        {mobileSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                                        ? 'bg-white w-6'
                                        : 'bg-white/40 hover:bg-white/60'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop: Imagem estática */}
                <div
                    className="hidden md:flex relative overflow-hidden rounded-xl bg-primary min-h-[600px] flex-col justify-end p-16 bg-cover bg-center"
                    style={{ backgroundImage: `linear-gradient(rgba(11, 36, 42, 0.3) 0%, rgba(11, 36, 42, 0.8) 100%), url('/hero-background-new.png')` }}
                    role="banner"
                    aria-label={content.backgroundImageAlt}
                >
                    <div className="max-w-[720px] flex flex-col gap-6">
                        <div className="flex items-center gap-2 text-white/90">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            <span className="text-sm font-bold tracking-wider uppercase">{content.preHeading}</span>
                        </div>
                        <h1 className="text-white text-6xl lg:text-7xl font-bold font-display leading-tight tracking-tighter">
                            {content.heading}
                        </h1>
                        <p className="text-white/90 text-xl font-normal font-body leading-relaxed max-w-[600px]">
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
