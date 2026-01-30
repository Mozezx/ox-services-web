
import React from 'react';
import type { Service } from '../types';

interface ServiceCardProps {
    service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
    // Mapeamento dos IDs de serviço para as páginas HTML
    const servicePages: { [key: string]: string } = {
        joinery: '/services/joinery.html',
        solar: '/services/solar.html',
        furniture: '/services/furniture.html',
        roofing: '/services/roofing.html',
    };

    const serviceUrl = servicePages[service.id] || '#services';

    return (
        <a
            href={serviceUrl}
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 block"
        >
            <div
                className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `linear-gradient(0deg, rgba(11, 36, 42, 0.90) 0%, rgba(11, 36, 42, 0.4) 100%), url("${service.imageUrl}")` }}
                aria-hidden="true"
            ></div>
            <div className="relative z-10 p-8 flex flex-col h-[360px] justify-between text-white">
                <div className="bg-white/10 backdrop-blur-md size-12 rounded-lg flex items-center justify-center border border-white/20">
                    <span className="material-symbols-outlined notranslate" translate="no">{service.icon}</span>
                </div>
                <div>
                    <h3 className="text-2xl font-bold font-display mb-2">{service.title}</h3>
                    <p className="text-white/80 text-base font-body mb-6">{service.description}</p>
                    <span className="flex items-center gap-2 font-bold text-sm uppercase tracking-wide group-hover:gap-3 transition-all" aria-label={`Learn more about ${service.title}`}>
                        Learn More
                        <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1 notranslate" translate="no">arrow_right_alt</span>
                    </span>
                </div>
            </div>
        </a>
    );
};

export default ServiceCard;

