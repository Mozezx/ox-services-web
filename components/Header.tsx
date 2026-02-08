
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

interface NavLink {
    name: string;
    href: string;
}

interface HeaderProps {
    companyName: string;
    navLinks: NavLink[];
    ctaButtonText: string;
}

const Header: React.FC<HeaderProps> = ({ companyName, navLinks, ctaButtonText }) => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const lastScrollY = useRef(0);

    // Verifica se está na página de obra (rota /obra/:token)
    const isWorkPage = location.pathname.startsWith('/obra/');

    // Ajusta os links: se estiver na página de obra, redireciona para a home com hash
    const getLinkHref = (href: string) => {
        if (isWorkPage && href.startsWith('#')) {
            return `/${href}`;
        }
        return href;
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;

            // Adiciona/remove classe 'scrolled' baseado na posição
            if (currentY > 40) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            // Esconde ao rolar para baixo, mostra ao rolar para cima
            // NÃO esconde se o menu mobile estiver aberto
            if (!isMenuOpen && currentY > lastScrollY.current + 6 && currentY > 40) {
                setIsHidden(true);
            } else if (currentY < lastScrollY.current - 6) {
                setIsHidden(false);
            }

            // Sempre mostra quando está no topo
            if (currentY < 10) {
                setIsHidden(false);
            }

            lastScrollY.current = currentY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMenuOpen]);

    return (
        <header className={`navbar sticky top-0 z-50 w-full bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ${isScrolled ? 'scrolled' : ''} ${isHidden ? 'nav-hidden' : ''}`}>
            <div className="mx-auto max-w-[1280px] px-4 md:px-10">
                <div className="flex items-center justify-between h-20">
                    <a href={isWorkPage ? "/" : "#home"} className="flex items-center gap-3 text-primary dark:text-white" aria-label={`${companyName} homepage`}>
                        <img src="/logo.png" alt={companyName} className="h-12 md:h-16 w-auto rounded-lg" />
                    </a>

                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a key={link.name} href={getLinkHref(link.href)} className="text-primary/80 dark:text-white/80 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors">
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
                        <LanguageSelector />
                        <a href={isWorkPage ? "/#contact" : "#contact"} className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors">
                            {ctaButtonText}
                        </a>
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                        <LanguageSelector />
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-primary dark:text-white" aria-label="Toggle mobile menu" aria-expanded={isMenuOpen}>
                            <span className="material-symbols-outlined text-3xl notranslate" translate="no">{isMenuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>
                {isMenuOpen && (
                    <div className="md:hidden pb-4">
                        <nav className="flex flex-col items-center gap-4">
                            {navLinks.map((link) => (
                                <a key={link.name} href={getLinkHref(link.href)} onClick={() => setIsMenuOpen(false)} className="text-primary/80 dark:text-white/80 hover:text-primary dark:hover:text-white py-2 text-base font-medium transition-colors">
                                    {link.name}
                                </a>
                            ))}
                            <a href={isWorkPage ? "/#contact" : "#contact"} onClick={() => setIsMenuOpen(false)} className="w-full mt-2 flex items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary-hover text-white text-base font-bold transition-colors">
                                {ctaButtonText}
                            </a>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
