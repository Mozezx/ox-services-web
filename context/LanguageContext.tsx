import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'nl' | 'es' | 'fr';

interface TextData {
    companyName: string;
    navigation: { name: string; href: string }[];
    ctaButton: string;
    hero: {
        preHeading: string;
        heading: string;
        subHeading: string;
        primaryAction: string;
        secondaryAction: string;
        backgroundImageAlt: string;
    };
    stats: { value: string; label: string }[];
    services: {
        heading: string;
        subHeading: string;
        viewAll: string;
        items: {
            id: string;
            title: string;
            description: string;
            icon: string;
            imageUrl: string;
            link: string;
        }[];
    };
    portfolio: {
        heading: string;
        subHeading: string;
        projects: {
            id: string;
            title: string;
            category: string;
            imageUrl: string;
            videoUrl?: string;
        }[];
    };
    cta: {
        heading: string;
        subHeading: string;
        primaryAction: string;
        secondaryAction: string;
    };
    contact: {
        heading: string;
        subHeading: string;
        form: {
            fullNameLabel: string;
            fullNamePlaceholder: string;
            companyLabel: string;
            companyPlaceholder: string;
            emailLabel: string;
            emailPlaceholder: string;
            phoneLabel: string;
            phonePlaceholder: string;
            messageLabel: string;
            messagePlaceholder: string;
            submitButton: string;
            errors: {
                nameRequired: string;
                emailRequired: string;
                emailInvalid: string;
                phoneInvalid: string;
            };
            successMessage: string;
        };
    };
    footer: {
        about: string;
        quickLinks: { title: string; links: { name: string; href: string }[] };
        services: { title: string; links: { name: string; href: string }[] };
        contactInfo: { title: string; address: string; phone: string; email: string };
        copyright: string;
    };
}

const translations: Record<Language, TextData> = {
    en: {
        companyName: 'OX Services',
        navigation: [
            { name: 'Home', href: '#home' },
            { name: 'Services', href: '#services' },
            { name: 'Portfolio', href: '#portfolio' },
            { name: 'Contact', href: '#contact' },
        ],
        ctaButton: 'Get a Quote',
        hero: {
            preHeading: 'Premium Infrastructure Solutions',
            heading: 'Building Excellence from the Ground Up',
            subHeading: 'With sophisticated design, we engineer and install premium infrastructure and bespoke interior finishes for the modern era.',
            primaryAction: 'Get a Quote',
            secondaryAction: 'View Portfolio',
            backgroundImageAlt: 'Modern construction project',
        },
        stats: [
            { value: '500+', label: 'Projects Completed' },
            { value: '15+', label: 'Years Experience' },
            { value: '100%', label: 'Client Satisfaction' },
            { value: '50+', label: 'Expert Team' },
        ],
        services: {
            heading: 'Our Expertise',
            subHeading: 'Delivering specialized solutions engineered for durability, efficiency, and aesthetic excellence in residential and commercial infrastructure.',
            viewAll: 'View All Services',
            items: [
                {
                    id: 'joinery',
                    title: 'Aluminum Joinery & Glazing',
                    description: 'Harnessing technical precision, our windows and doors offer unparalleled thermal performance and durability, enhancing any architectural design.',
                    icon: 'window',
                    imageUrl: '/aluminum-joinery.png',
                    link: '/services/joinery.html',
                },
                {
                    id: 'solar',
                    title: 'Solar PV Systems',
                    description: 'Achieve superior energy efficiency with our integrated solar solutions. We design and install high-yield PV systems for commercial and residential properties.',
                    icon: 'solar_power',
                    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
                    link: '/services/solar.html',
                },
                {
                    id: 'furniture',
                    title: 'Bespoke Furniture & Doors',
                    description: 'Our master craftsmen create durable, bespoke interior pieces that perfectly align with your architectural vision, from executive desks to statement doors.',
                    icon: 'chair',
                    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
                    link: '/services/furniture.html',
                },
                {
                    id: 'roofing',
                    title: 'EPDM Rubber Membrane Roofing',
                    description: 'Our industrial-grade EPDM rubber membrane provides a seamless, waterproof barrier with a 50-year life expectancy, ensuring ultimate durability and protection.',
                    icon: 'roofing',
                    imageUrl: '/epdm-roofing.png',
                    link: '/services/roofing.html',
                },
            ],
        },
        portfolio: {
            heading: 'Transforming Spaces, Building Dreams',
            subHeading: 'See how we bring renovation projects to life, from complete makeovers to specialized infrastructure solutions.',
            projects: [
                {
                    id: 'p1',
                    title: 'Complete Home Renovation',
                    category: 'Full Renovation',
                    imageUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1600&q=80',
                    videoUrl: 'https://res.cloudinary.com/dswtssvkq/video/upload/v1766092988/1218_kli8yz.mp4',
                },
                {
                    id: 'p2',
                    title: 'Urban Solar Integration',
                    category: 'Solar PV Systems',
                    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80',
                },
                {
                    id: 'p3',
                    title: 'Executive Boardroom',
                    category: 'Bespoke Furniture',
                    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
                },
                {
                    id: 'p4',
                    title: 'Flat Roof Waterproofing',
                    category: 'EPDM Roofing',
                    imageUrl: '/epdm-roofing.png',
                },
                {
                    id: 'p5',
                    title: 'Premium Window Installation',
                    category: 'Aluminum Joinery',
                    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                },
            ],
        },
        cta: {
            heading: 'Ready to Start Your Project?',
            subHeading: 'Get in touch with our team to discuss your requirements and receive a free consultation.',
            primaryAction: 'Contact Us',
            secondaryAction: 'View Projects',
        },
        contact: {
            heading: 'Get in Touch',
            subHeading: 'Ready to start your project? Contact us today for a free consultation.',
            form: {
                fullNameLabel: 'Full Name *',
                fullNamePlaceholder: 'Your full name',
                companyLabel: 'Company',
                companyPlaceholder: 'Your company name',
                emailLabel: 'Email *',
                emailPlaceholder: 'your@email.com',
                phoneLabel: 'Phone',
                phonePlaceholder: '+31 6 12345678',
                messageLabel: 'Message',
                messagePlaceholder: 'Tell us about your project...',
                submitButton: 'Send Message',
                errors: {
                    nameRequired: 'Name is required',
                    emailRequired: 'Email is required',
                    emailInvalid: 'Please enter a valid email',
                    phoneInvalid: 'Please enter a valid phone number',
                },
                successMessage: 'Thank you! We will contact you soon.',
            },
        },
        footer: {
            about: 'Building excellence through quality craftsmanship and innovative solutions for over 15 years.',
            quickLinks: {
                title: 'Quick Links',
                links: [
                    { name: 'Home', href: '#home' },
                    { name: 'Services', href: '#services' },
                    { name: 'Portfolio', href: '#portfolio' },
                    { name: 'Contact', href: '#contact' },
                ],
            },
            services: {
                title: 'Services',
                links: [
                    { name: 'Solar PV Systems', href: '/services/solar.html' },
                    { name: 'EPDM Roofing', href: '/services/roofing.html' },
                    { name: 'Aluminum Joinery', href: '/services/joinery.html' },
                    { name: 'Bespoke Furniture', href: '/services/furniture.html' },
                ],
            },
            contactInfo: {
                title: 'Contact',
                address: 'Netherlands',
                phone: '+31 6 12345678',
                email: 'info@oxservices.com',
            },
            copyright: '© 2024 OX Services. All rights reserved.',
        },
    },
    nl: {
        companyName: 'OX Services',
        navigation: [
            { name: 'Home', href: '#home' },
            { name: 'Diensten', href: '#services' },
            { name: 'Portfolio', href: '#portfolio' },
            { name: 'Contact', href: '#contact' },
        ],
        ctaButton: 'Offerte Aanvragen',
        hero: {
            preHeading: 'Premium Infrastructuur Oplossingen',
            heading: 'Bouwen aan Uitmuntendheid vanaf de Grond',
            subHeading: 'Met geavanceerd ontwerp engineeren en installeren wij premium infrastructuur en op maat gemaakte interieurafwerkingen voor het moderne tijdperk.',
            primaryAction: 'Offerte Aanvragen',
            secondaryAction: 'Portfolio Bekijken',
            backgroundImageAlt: 'Modern bouwproject',
        },
        stats: [
            { value: '500+', label: 'Projecten Voltooid' },
            { value: '15+', label: 'Jaar Ervaring' },
            { value: '100%', label: 'Klanttevredenheid' },
            { value: '50+', label: 'Expert Team' },
        ],
        services: {
            heading: 'Onze Expertise',
            subHeading: 'Gespecialiseerde oplossingen voor duurzaamheid, efficiëntie en esthetische uitmuntendheid in residentiële en commerciële infrastructuur.',
            viewAll: 'Alle Diensten Bekijken',
            items: [
                {
                    id: 'joinery',
                    title: 'Aluminium Schrijnwerk & Beglazing',
                    description: 'Met technische precisie bieden onze ramen en deuren ongeëvenaarde thermische prestaties en duurzaamheid.',
                    icon: 'window',
                    imageUrl: '/aluminum-joinery.png',
                    link: '/services/joinery.html',
                },
                {
                    id: 'solar',
                    title: 'Zonne-energie Systemen',
                    description: 'Bereik superieure energie-efficiëntie met onze geïntegreerde zonne-oplossingen voor commerciële en residentiële panden.',
                    icon: 'solar_power',
                    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
                    link: '/services/solar.html',
                },
                {
                    id: 'furniture',
                    title: 'Maatwerk Meubels & Deuren',
                    description: 'Onze meester-ambachtslieden creëren duurzame, op maat gemaakte interieurstukken die perfect aansluiten bij uw visie.',
                    icon: 'chair',
                    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
                    link: '/services/furniture.html',
                },
                {
                    id: 'roofing',
                    title: 'EPDM Rubber Dakbedekking',
                    description: 'Onze industriële EPDM rubbermembraan biedt een naadloze, waterdichte barrière met een levensduur van 50 jaar.',
                    icon: 'roofing',
                    imageUrl: '/epdm-roofing.png',
                    link: '/services/roofing.html',
                },
            ],
        },
        portfolio: {
            heading: 'Ruimtes Transformeren, Dromen Bouwen',
            subHeading: 'Zie hoe wij renovatieprojecten tot leven brengen, van complete make-overs tot gespecialiseerde infrastructuuroplossingen.',
            projects: [
                {
                    id: 'p1',
                    title: 'Complete Woningrenovatie',
                    category: 'Volledige Renovatie',
                    imageUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1600&q=80',
                    videoUrl: 'https://res.cloudinary.com/dswtssvkq/video/upload/v1766092988/1218_kli8yz.mp4',
                },
                {
                    id: 'p2',
                    title: 'Stedelijke Zonne-integratie',
                    category: 'Zonne-energie Systemen',
                    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80',
                },
                {
                    id: 'p3',
                    title: 'Executive Boardroom',
                    category: 'Maatwerk Meubels',
                    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
                },
                {
                    id: 'p4',
                    title: 'Plat Dak Waterdichting',
                    category: 'EPDM Dakbedekking',
                    imageUrl: '/epdm-roofing.png',
                },
                {
                    id: 'p5',
                    title: 'Premium Raaminstallatie',
                    category: 'Aluminium Schrijnwerk',
                    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                },
            ],
        },
        cta: {
            heading: 'Klaar om Uw Project te Starten?',
            subHeading: 'Neem contact op met ons team om uw wensen te bespreken en ontvang een gratis adviesgesprek.',
            primaryAction: 'Neem Contact Op',
            secondaryAction: 'Bekijk Projecten',
        },
        contact: {
            heading: 'Neem Contact Op',
            subHeading: 'Klaar om uw project te starten? Neem vandaag nog contact met ons op voor een gratis adviesgesprek.',
            form: {
                fullNameLabel: 'Volledige Naam *',
                fullNamePlaceholder: 'Uw volledige naam',
                companyLabel: 'Bedrijf',
                companyPlaceholder: 'Uw bedrijfsnaam',
                emailLabel: 'E-mail *',
                emailPlaceholder: 'uw@email.com',
                phoneLabel: 'Telefoon',
                phonePlaceholder: '+31 6 12345678',
                messageLabel: 'Bericht',
                messagePlaceholder: 'Vertel ons over uw project...',
                submitButton: 'Bericht Versturen',
                errors: {
                    nameRequired: 'Naam is verplicht',
                    emailRequired: 'E-mail is verplicht',
                    emailInvalid: 'Voer een geldig e-mailadres in',
                    phoneInvalid: 'Voer een geldig telefoonnummer in',
                },
                successMessage: 'Bedankt! Wij nemen spoedig contact met u op.',
            },
        },
        footer: {
            about: 'Al meer dan 15 jaar bouwen aan uitmuntendheid door kwaliteitsvakmanschap en innovatieve oplossingen.',
            quickLinks: {
                title: 'Snelle Links',
                links: [
                    { name: 'Home', href: '#home' },
                    { name: 'Diensten', href: '#services' },
                    { name: 'Portfolio', href: '#portfolio' },
                    { name: 'Contact', href: '#contact' },
                ],
            },
            services: {
                title: 'Diensten',
                links: [
                    { name: 'Zonne-energie Systemen', href: '/services/solar.html' },
                    { name: 'EPDM Dakbedekking', href: '/services/roofing.html' },
                    { name: 'Aluminium Schrijnwerk', href: '/services/joinery.html' },
                    { name: 'Maatwerk Meubels', href: '/services/furniture.html' },
                ],
            },
            contactInfo: {
                title: 'Contact',
                address: 'Nederland',
                phone: '+31 6 12345678',
                email: 'info@oxservices.com',
            },
            copyright: '© 2024 OX Services. Alle rechten voorbehouden.',
        },
    },
    es: {
        companyName: 'OX Services',
        navigation: [
            { name: 'Inicio', href: '#home' },
            { name: 'Servicios', href: '#services' },
            { name: 'Portafolio', href: '#portfolio' },
            { name: 'Contacto', href: '#contact' },
        ],
        ctaButton: 'Solicitar Cotización',
        hero: {
            preHeading: 'Soluciones de Infraestructura Premium',
            heading: 'Construyendo Excelencia desde la Base',
            subHeading: 'Con diseño sofisticado, diseñamos e instalamos infraestructura premium y acabados interiores a medida para la era moderna.',
            primaryAction: 'Solicitar Cotización',
            secondaryAction: 'Ver Portafolio',
            backgroundImageAlt: 'Proyecto de construcción moderno',
        },
        stats: [
            { value: '500+', label: 'Proyectos Completados' },
            { value: '15+', label: 'Años de Experiencia' },
            { value: '100%', label: 'Satisfacción del Cliente' },
            { value: '50+', label: 'Equipo Experto' },
        ],
        services: {
            heading: 'Nuestra Experiencia',
            subHeading: 'Soluciones especializadas diseñadas para durabilidad, eficiencia y excelencia estética en infraestructura residencial y comercial.',
            viewAll: 'Ver Todos los Servicios',
            items: [
                {
                    id: 'joinery',
                    title: 'Carpintería de Aluminio y Acristalamiento',
                    description: 'Con precisión técnica, nuestras ventanas y puertas ofrecen un rendimiento térmico y durabilidad incomparables.',
                    icon: 'window',
                    imageUrl: '/aluminum-joinery.png',
                    link: '/services/joinery.html',
                },
                {
                    id: 'solar',
                    title: 'Sistemas Solares Fotovoltaicos',
                    description: 'Logre una eficiencia energética superior con nuestras soluciones solares integradas para propiedades comerciales y residenciales.',
                    icon: 'solar_power',
                    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
                    link: '/services/solar.html',
                },
                {
                    id: 'furniture',
                    title: 'Muebles y Puertas a Medida',
                    description: 'Nuestros maestros artesanos crean piezas interiores duraderas y a medida que se alinean perfectamente con su visión arquitectónica.',
                    icon: 'chair',
                    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
                    link: '/services/furniture.html',
                },
                {
                    id: 'roofing',
                    title: 'Techos de Membrana EPDM',
                    description: 'Nuestra membrana de caucho EPDM de grado industrial proporciona una barrera impermeable sin costuras con una expectativa de vida de 50 años.',
                    icon: 'roofing',
                    imageUrl: '/epdm-roofing.png',
                    link: '/services/roofing.html',
                },
            ],
        },
        portfolio: {
            heading: 'Transformando Espacios, Construyendo Sueños',
            subHeading: 'Vea cómo damos vida a proyectos de renovación, desde transformaciones completas hasta soluciones de infraestructura especializadas.',
            projects: [
                {
                    id: 'p1',
                    title: 'Renovación Completa del Hogar',
                    category: 'Renovación Completa',
                    imageUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1600&q=80',
                    videoUrl: 'https://res.cloudinary.com/dswtssvkq/video/upload/v1766092988/1218_kli8yz.mp4',
                },
                {
                    id: 'p2',
                    title: 'Integración Solar Urbana',
                    category: 'Sistemas Solares',
                    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80',
                },
                {
                    id: 'p3',
                    title: 'Sala de Juntas Ejecutiva',
                    category: 'Muebles a Medida',
                    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
                },
                {
                    id: 'p4',
                    title: 'Impermeabilización de Techo Plano',
                    category: 'Techos EPDM',
                    imageUrl: '/epdm-roofing.png',
                },
                {
                    id: 'p5',
                    title: 'Instalación de Ventanas Premium',
                    category: 'Carpintería de Aluminio',
                    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                },
            ],
        },
        cta: {
            heading: '¿Listo para Iniciar su Proyecto?',
            subHeading: 'Póngase en contacto con nuestro equipo para discutir sus requisitos y recibir una consulta gratuita.',
            primaryAction: 'Contáctenos',
            secondaryAction: 'Ver Proyectos',
        },
        contact: {
            heading: 'Contáctenos',
            subHeading: '¿Listo para iniciar su proyecto? Contáctenos hoy para una consulta gratuita.',
            form: {
                fullNameLabel: 'Nombre Completo *',
                fullNamePlaceholder: 'Su nombre completo',
                companyLabel: 'Empresa',
                companyPlaceholder: 'Nombre de su empresa',
                emailLabel: 'Correo Electrónico *',
                emailPlaceholder: 'su@correo.com',
                phoneLabel: 'Teléfono',
                phonePlaceholder: '+34 612 345 678',
                messageLabel: 'Mensaje',
                messagePlaceholder: 'Cuéntenos sobre su proyecto...',
                submitButton: 'Enviar Mensaje',
                errors: {
                    nameRequired: 'El nombre es obligatorio',
                    emailRequired: 'El correo es obligatorio',
                    emailInvalid: 'Por favor ingrese un correo válido',
                    phoneInvalid: 'Por favor ingrese un teléfono válido',
                },
                successMessage: '¡Gracias! Nos pondremos en contacto pronto.',
            },
        },
        footer: {
            about: 'Construyendo excelencia a través de artesanía de calidad y soluciones innovadoras durante más de 15 años.',
            quickLinks: {
                title: 'Enlaces Rápidos',
                links: [
                    { name: 'Inicio', href: '#home' },
                    { name: 'Servicios', href: '#services' },
                    { name: 'Portafolio', href: '#portfolio' },
                    { name: 'Contacto', href: '#contact' },
                ],
            },
            services: {
                title: 'Servicios',
                links: [
                    { name: 'Sistemas Solares', href: '/services/solar.html' },
                    { name: 'Techos EPDM', href: '/services/roofing.html' },
                    { name: 'Carpintería de Aluminio', href: '/services/joinery.html' },
                    { name: 'Muebles a Medida', href: '/services/furniture.html' },
                ],
            },
            contactInfo: {
                title: 'Contacto',
                address: 'Países Bajos',
                phone: '+31 6 12345678',
                email: 'info@oxservices.com',
            },
            copyright: '© 2024 OX Services. Todos los derechos reservados.',
        },
    },
    fr: {
        companyName: 'OX Services',
        navigation: [
            { name: 'Accueil', href: '#home' },
            { name: 'Services', href: '#services' },
            { name: 'Portfolio', href: '#portfolio' },
            { name: 'Contact', href: '#contact' },
        ],
        ctaButton: 'Demander un Devis',
        hero: {
            preHeading: "Solutions d'Infrastructure Premium",
            heading: "Construire l'Excellence depuis le Sol",
            subHeading: "Avec un design sophistiqué, nous concevons et installons des infrastructures premium et des finitions intérieures sur mesure pour l'ère moderne.",
            primaryAction: 'Demander un Devis',
            secondaryAction: 'Voir le Portfolio',
            backgroundImageAlt: 'Projet de construction moderne',
        },
        stats: [
            { value: '500+', label: 'Projets Réalisés' },
            { value: '15+', label: "Années d'Expérience" },
            { value: '100%', label: 'Satisfaction Client' },
            { value: '50+', label: "Équipe d'Experts" },
        ],
        services: {
            heading: 'Notre Expertise',
            subHeading: 'Solutions spécialisées conçues pour la durabilité, l\'efficacité et l\'excellence esthétique dans les infrastructures résidentielles et commerciales.',
            viewAll: 'Voir Tous les Services',
            items: [
                {
                    id: 'joinery',
                    title: 'Menuiserie Aluminium & Vitrage',
                    description: 'Avec précision technique, nos fenêtres et portes offrent des performances thermiques et une durabilité inégalées.',
                    icon: 'window',
                    imageUrl: '/aluminum-joinery.png',
                    link: '/services/joinery.html',
                },
                {
                    id: 'solar',
                    title: 'Systèmes Solaires Photovoltaïques',
                    description: 'Atteignez une efficacité énergétique supérieure avec nos solutions solaires intégrées pour propriétés commerciales et résidentielles.',
                    icon: 'solar_power',
                    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
                    link: '/services/solar.html',
                },
                {
                    id: 'furniture',
                    title: 'Mobilier et Portes Sur Mesure',
                    description: 'Nos maîtres artisans créent des pièces intérieures durables et sur mesure qui s\'alignent parfaitement avec votre vision architecturale.',
                    icon: 'chair',
                    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
                    link: '/services/furniture.html',
                },
                {
                    id: 'roofing',
                    title: 'Toiture Membrane EPDM',
                    description: 'Notre membrane en caoutchouc EPDM de qualité industrielle offre une barrière étanche sans couture avec une espérance de vie de 50 ans.',
                    icon: 'roofing',
                    imageUrl: '/epdm-roofing.png',
                    link: '/services/roofing.html',
                },
            ],
        },
        portfolio: {
            heading: 'Transformer les Espaces, Construire des Rêves',
            subHeading: 'Découvrez comment nous donnons vie aux projets de rénovation, des transformations complètes aux solutions d\'infrastructure spécialisées.',
            projects: [
                {
                    id: 'p1',
                    title: 'Rénovation Complète de Maison',
                    category: 'Rénovation Complète',
                    imageUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1600&q=80',
                    videoUrl: 'https://res.cloudinary.com/dswtssvkq/video/upload/v1766092988/1218_kli8yz.mp4',
                },
                {
                    id: 'p2',
                    title: 'Intégration Solaire Urbaine',
                    category: 'Systèmes Solaires',
                    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80',
                },
                {
                    id: 'p3',
                    title: 'Salle de Conseil Exécutive',
                    category: 'Mobilier Sur Mesure',
                    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
                },
                {
                    id: 'p4',
                    title: 'Étanchéité de Toit Plat',
                    category: 'Toiture EPDM',
                    imageUrl: '/epdm-roofing.png',
                },
                {
                    id: 'p5',
                    title: 'Installation de Fenêtres Premium',
                    category: 'Menuiserie Aluminium',
                    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                },
            ],
        },
        cta: {
            heading: 'Prêt à Démarrer Votre Projet?',
            subHeading: 'Contactez notre équipe pour discuter de vos besoins et recevoir une consultation gratuite.',
            primaryAction: 'Contactez-nous',
            secondaryAction: 'Voir les Projets',
        },
        contact: {
            heading: 'Contactez-nous',
            subHeading: "Prêt à démarrer votre projet? Contactez-nous aujourd'hui pour une consultation gratuite.",
            form: {
                fullNameLabel: 'Nom Complet *',
                fullNamePlaceholder: 'Votre nom complet',
                companyLabel: 'Entreprise',
                companyPlaceholder: 'Nom de votre entreprise',
                emailLabel: 'Email *',
                emailPlaceholder: 'votre@email.com',
                phoneLabel: 'Téléphone',
                phonePlaceholder: '+33 6 12 34 56 78',
                messageLabel: 'Message',
                messagePlaceholder: 'Parlez-nous de votre projet...',
                submitButton: 'Envoyer le Message',
                errors: {
                    nameRequired: 'Le nom est obligatoire',
                    emailRequired: "L'email est obligatoire",
                    emailInvalid: 'Veuillez entrer un email valide',
                    phoneInvalid: 'Veuillez entrer un numéro valide',
                },
                successMessage: 'Merci! Nous vous contacterons bientôt.',
            },
        },
        footer: {
            about: "Construire l'excellence grâce à un savoir-faire de qualité et des solutions innovantes depuis plus de 15 ans.",
            quickLinks: {
                title: 'Liens Rapides',
                links: [
                    { name: 'Accueil', href: '#home' },
                    { name: 'Services', href: '#services' },
                    { name: 'Portfolio', href: '#portfolio' },
                    { name: 'Contact', href: '#contact' },
                ],
            },
            services: {
                title: 'Services',
                links: [
                    { name: 'Systèmes Solaires', href: '/services/solar.html' },
                    { name: 'Toiture EPDM', href: '/services/roofing.html' },
                    { name: 'Menuiserie Aluminium', href: '/services/joinery.html' },
                    { name: 'Mobilier Sur Mesure', href: '/services/furniture.html' },
                ],
            },
            contactInfo: {
                title: 'Contact',
                address: 'Pays-Bas',
                phone: '+31 6 12345678',
                email: 'info@oxservices.com',
            },
            copyright: '© 2024 OX Services. Tous droits réservés.',
        },
    },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    textData: TextData;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && ['en', 'nl', 'es', 'fr'].includes(savedLang)) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const textData = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, textData }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const languageNames: Record<Language, string> = {
    en: 'English',
    nl: 'Nederlands',
    es: 'Español',
    fr: 'Français',
};

export const languageFlags: Record<Language, string> = {
    en: '/flags/gb.svg',
    nl: '/flags/nl.svg',
    es: '/flags/es.svg',
    fr: '/flags/fr.svg',
};
