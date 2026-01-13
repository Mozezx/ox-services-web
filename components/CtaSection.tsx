
import React from 'react';

interface CtaProps {
    content: {
        heading: string;
        subHeading: string;
        primaryAction: string;
        secondaryAction: string;
    }
}

const CtaSection: React.FC<CtaProps> = ({ content }) => {
    return (
        <section className="w-full flex justify-center py-20 px-4 md:px-10 bg-primary dark:bg-black text-white">
            <div className="w-full max-w-[960px] flex flex-col items-center text-center gap-6">
                <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight">{content.heading}</h2>
                <p className="text-white/80 text-lg md:text-xl max-w-2xl font-body">{content.subHeading}</p>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <a href="#contact" className="flex min-w-[160px] h-12 items-center justify-center rounded-lg bg-white text-primary hover:bg-gray-100 text-base font-bold transition-colors" aria-label="Contact us for a consultation">
                        {content.primaryAction}
                    </a>
                    <a href="#portfolio" className="flex min-w-[160px] h-12 items-center justify-center rounded-lg border border-white/30 hover:bg-white/10 text-white text-base font-bold transition-colors" aria-label="View our project portfolio">
                        {content.secondaryAction}
                    </a>
                </div>
            </div>
        </section>
    );
};

export default CtaSection;
