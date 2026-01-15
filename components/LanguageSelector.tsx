import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language, languageNames, languageFlags } from '../context/LanguageContext';

const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages: Language[] = ['en', 'nl', 'es', 'fr'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/5 dark:hover:bg-white/5 transition-colors text-primary dark:text-white"
                aria-label="Select language"
            >
                <span className="material-symbols-outlined text-xl notranslate" translate="no">translate</span>
                <span className="hidden sm:inline text-sm font-medium">{languageNames[language]}</span>
                <span className="material-symbols-outlined text-sm notranslate" translate="no">{isOpen ? 'expand_less' : 'expand_more'}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1a2629] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => {
                                setLanguage(lang);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/5 dark:hover:bg-white/5 transition-colors ${language === lang ? 'bg-primary/10 dark:bg-white/10' : ''
                                }`}
                        >
                            <img src={languageFlags[lang]} alt={languageNames[lang]} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                            <span className="text-sm font-medium text-primary dark:text-white">
                                {languageNames[lang]}
                            </span>
                            {language === lang && (
                                <span className="material-symbols-outlined text-primary dark:text-white text-sm ml-auto notranslate" translate="no">check</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
