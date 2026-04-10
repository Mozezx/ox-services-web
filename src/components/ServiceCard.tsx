
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
            className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 block"
        >
            <div
                className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url("${service.imageUrl}")` }}
                aria-hidden="true"
            ></div>
            {/* Filtro cinza/escuro para legibilidade - some no hover */}
            <div className="absolute inset-0 bg-black/40 z-[5] transition-opacity duration-300 group-hover:opacity-0"></div>
            <div className="relative z-10 h-[360px] p-8 flex flex-col justify-between text-white">
                {/* Learn More no Topo Direito - aparece apenas no hover */}
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all drop-shadow-md">
                        <span>Learn More</span>
                        <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1 notranslate" translate="no">arrow_right_alt</span>
                    </div>
                </div>

                {/* Título na Base */}
                <h3 className="text-2xl md:text-3xl font-bold font-display leading-tight drop-shadow-xl">
                    {service.title}
                </h3>
            </div>
        </a>
    );
};

export default ServiceCard;

