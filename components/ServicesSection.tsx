
import React from 'react';
import ServiceCard from './ServiceCard';
import type { Service } from '../types';

interface ServicesSectionProps {
    content: {
        heading: string;
        subHeading: string;
        viewAll: string;
        items: Service[];
    };
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ content }) => {
    return (
        <section className="w-full flex flex-col items-center py-16 pb-20 px-4 md:px-10">
            <div className="w-full max-w-[1280px]">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
                    <div>
                        <h2 className="text-white text-3xl md:text-4xl font-bold font-display leading-tight tracking-tight mb-3">{content.heading}</h2>
                        <p className="text-white/70 max-w-xl text-lg font-body">{content.subHeading}</p>
                    </div>
                    <a className="flex items-center gap-2 text-primary dark:text-white font-bold hover:underline whitespace-nowrap" href="#services">
                        {content.viewAll}
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.items.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
