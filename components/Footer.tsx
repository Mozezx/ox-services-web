
import React from 'react';

interface Link { name: string; href: string; }

interface FooterProps {
    companyName: string;
    content: {
        about: string;
        quickLinks: { title: string; links: Link[]; };
        services: { title: string; links: Link[]; };
        contactInfo: { title: string; address: string; phone: string; email: string; };
        copyright: string;
    };
}

const Footer: React.FC<FooterProps> = ({ companyName, content }) => {
    return (
        <footer className="bg-primary dark:bg-black text-white border-t border-white/10 pt-16 pb-8">
            <div className="mx-auto max-w-[1280px] px-4 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-white mb-2">
                            <img src="/logo.png" alt={companyName} className="h-12 w-auto rounded-lg" />
                        </div>
                        <p className="text-white/60 text-sm font-body leading-relaxed">
                            {content.about}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-base font-display">{content.quickLinks.title}</h3>
                        <div className="flex flex-col gap-2">
                            {content.quickLinks.links.map(link => (
                                <a key={link.name} href={link.href} className="text-white/60 hover:text-white text-sm font-body transition-colors">{link.name}</a>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-base font-display">{content.services.title}</h3>
                        <div className="flex flex-col gap-2">
                            {content.services.links.map(link => (
                                <a key={link.name} href={link.href} className="text-white/60 hover:text-white text-sm font-body transition-colors">{link.name}</a>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-base font-display">{content.contactInfo.title}</h3>
                        <div className="flex flex-col gap-3 text-sm text-white/60 font-body">
                            <p className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-lg mt-0.5">location_on</span>
                                <span style={{ whiteSpace: 'pre-line' }}>{content.contactInfo.address}</span>
                            </p>
                            <a href={`tel:${content.contactInfo.phone}`} className="flex items-center gap-3 hover:text-white">
                                <span className="material-symbols-outlined text-lg">call</span>
                                {content.contactInfo.phone}
                            </a>
                            <a href={`mailto:${content.contactInfo.email}`} className="flex items-center gap-3 hover:text-white">
                                <span className="material-symbols-outlined text-lg">mail</span>
                                {content.contactInfo.email}
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-white/40 text-xs font-body">{content.copyright}</p>
                    {/* Social links can be added here */}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
