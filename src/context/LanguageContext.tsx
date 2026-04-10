import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'nl' | 'es' | 'fr' | 'pt';

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
    chat: {
        assistantName: string;
        onlineStatus: string;
        inputPlaceholder: string;
        needHelp: string;
        openChat: string;
        closeChat: string;
        initialMessage: string;
        errorMessage: string;
        fallbackGeneral: string;
    };
    workpage: {
        progressTitle: string;
        timelineTitle: string;
        commentsTitle: string;
        shareTitle: string;
        infoTitle: string;
        daysWorked: string;
        photosRecorded: string;
        videos: string;
        daysRemaining: string;
        totalDays: string;
        startDate: string;
        endDate: string;
        lastUpdate: string;
        teamResponsible: string;
        shareDescription: string;
        copyLink: string;
        linkCopied: string;
        accessToken: string;
        client: string;
        status: string;
        period: string;
        loading: string;
        preparing: string;
        workNotFound: string;
        workNotFoundDescription: string;
        backToHome: string;
        tryAgain: string;
        statusLabels: {
            in_progress: string;
            planned: string;
            completed: string;
        };
        records: (count: number) => string;
        commentsCount: (count: number) => string;
        today: string;
        moreDetails: string;
        lessDetails: string;
        totalPhotos: string;
        totalVideos: string;
        totalNotes: string;
        shareOnWhatsApp: string;
        followWorkProgress: string;
        installApp: string;
        installAppDescription: string;
        youAreOffline: string;
        dataOutdated: string;
    };
    comments: {
        title: string;
        commentsCount: (count: number) => string;
        likesCount: (count: number) => string;
        addComment: string;
        yourName: string;
        yourEmail: string;
        yourComment: string;
        submitComment: string;
        submitting: string;
        submitted: string;
        approvalNote: string;
        sortRecent: string;
        sortPopular: string;
        sortOldest: string;
        verified: string;
        awaitingApproval: string;
        minutesAgo: (mins: number) => string;
        hoursAgo: (hours: number) => string;
        daysAgo: (days: number) => string;
        yesterday: string;
        like: string;
        liked: string;
        reply: string;
        share: string;
        report: string;
        noComments: string;
        noCommentsDescription: string;
        replies: (count: number) => string;
        showReplies: string;
        hideReplies: string;
    };
    timeline: {
        emptyTitle: string;
        emptyDescription: string;
        photo: string;
        video: string;
        note: string;
        record: string;
        today: string;
        yesterday: string;
        daysAgo: (days: number) => string;
        like: string;
        liked: string;
        comment: string;
        share: string;
        download: string;
        showMore: string;
        showLess: string;
        loadFullHistory: string;
        showingEntries: (current: number, total: number) => string;
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
                    imageUrl: '/aluminum-joinery.webp',
                    link: '/services/joinery.html',
                },
                {
                    id: 'solar',
                    title: 'Solar PV Systems',
                    description: 'Achieve superior energy efficiency with our integrated solar solutions. We design and install high-yield PV systems for commercial and residential properties.',
                    icon: 'solar_power',
                    imageUrl: '/solar-pv-systems.png',
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
                    imageUrl: '/epdm-roofing.jpeg',
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
                    imageUrl: '/epdm-roofing.jpeg',
                },
                {
                    id: 'p5',
                    title: 'Premium Window Installation',
                    category: 'Aluminum Joinery',
                    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                },
            ],
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
                phonePlaceholder: '+32 492 80 13 53',
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
                address: 'Belgium',
                phone: '+32 492 80 13 53',
                email: 'info@oxservices.com',
            },
            copyright: '© 2024 OX Services. All rights reserved.',
        },
        chat: {
            assistantName: 'OX Services Assistant',
            onlineStatus: 'Online now',
            inputPlaceholder: 'Type your message...',
            needHelp: '💬 Need help?',
            openChat: 'Open AI chat',
            closeChat: 'Close chat',
            initialMessage: 'Hello! 👋 I\'m the OX Services virtual assistant. How can I help you today? What type of service are you looking for?',
            errorMessage: 'Sorry, an error occurred. Please try again or contact us via WhatsApp.',
            fallbackGeneral: 'Got it! We offer the following services:\n\n• **Aluminum Joinery** - Windows and doors\n• **Solar Energy** - PV systems\n• **Bespoke Furniture** - Custom design\n• **EPDM Roofing** - Waterproofing\n\nWhich of these services interests you? Or tell me more about your project!',
        },
        workpage: {
            progressTitle: 'Work Progress',
            timelineTitle: 'Work Timeline',
            commentsTitle: 'Comments and Observations',
            shareTitle: 'Share Access',
            infoTitle: 'Work Information',
            daysWorked: 'Days worked',
            photosRecorded: 'Photos recorded',
            videos: 'Videos',
            daysRemaining: 'Days remaining',
            totalDays: 'total days',
            startDate: 'Start date',
            endDate: 'Estimated completion',
            lastUpdate: 'Last update',
            teamResponsible: 'Responsible team',
            shareDescription: 'Share this link with others so they can follow the work in real time:',
            copyLink: 'Copy Link',
            linkCopied: 'Link copied!',
            accessToken: 'Access token',
            client: 'Client',
            status: 'Status',
            period: 'Period',
            loading: 'Loading work data...',
            preparing: 'Preparing the digital construction site',
            workNotFound: 'Work not found',
            workNotFoundDescription: 'The access token may be incorrect or this work is no longer available. Check the link or contact the work team.',
            backToHome: 'Back to home page',
            tryAgain: 'Try again',
            statusLabels: {
                in_progress: '🏗️ In progress',
                planned: '📅 Planned',
                completed: '✅ Completed',
            },
            records: (count: number) => `${count} ${count === 1 ? 'record' : 'records'}`,
            commentsCount: (count: number) => `${count} ${count === 1 ? 'comment' : 'comments'}`,
            today: 'Today',
            moreDetails: 'More details',
            lessDetails: 'Less details',
            totalPhotos: 'Total photos',
            totalVideos: 'Total videos',
            totalNotes: 'Total notes',
            shareOnWhatsApp: 'Share on WhatsApp',
            followWorkProgress: 'Follow the work progress:',
            installApp: 'Install App',
            installAppDescription: 'Add to home screen for quick access and update notifications.',
            youAreOffline: 'You are offline',
            dataOutdated: 'Some data may be outdated',
        },
        comments: {
            title: 'Comments and Feedback',
            commentsCount: (count: number) => `${count} ${count === 1 ? 'comment' : 'comments'}`,
            likesCount: (count: number) => `${count} likes`,
            addComment: 'Add Comment',
            yourName: 'Your name *',
            yourEmail: 'Your email (optional)',
            yourComment: 'Your comment *',
            submitComment: 'Submit Comment',
            submitting: 'Submitting...',
            submitted: '✓ Submitted!',
            approvalNote: 'Your comment will be visible after team approval.',
            sortRecent: 'Most recent',
            sortPopular: 'Most popular',
            sortOldest: 'Oldest',
            verified: 'Verified',
            awaitingApproval: 'Awaiting approval',
            minutesAgo: (mins: number) => `${mins} min ago`,
            hoursAgo: (hours: number) => `${hours} h ago`,
            daysAgo: (days: number) => `${days} days ago`,
            yesterday: 'Yesterday',
            like: 'Like',
            liked: 'Liked',
            reply: 'Reply',
            share: 'Share',
            report: 'Report',
            noComments: 'No comments yet',
            noCommentsDescription: 'Be the first to share your observations about the progress of this work.',
            replies: (count: number) => `${count} ${count === 1 ? 'reply' : 'replies'}`,
            showReplies: 'Show replies',
            hideReplies: 'Hide replies',
        },
        timeline: {
            emptyTitle: 'Empty Timeline',
            emptyDescription: 'There are no records in this work yet. The first record will appear here when the team starts documenting progress.',
            photo: 'Photo',
            video: 'Video',
            note: 'Note',
            record: 'Record',
            today: 'Today',
            yesterday: 'Yesterday',
            daysAgo: (days: number) => `${days} days ago`,
            like: 'Like',
            liked: 'Liked',
            comment: 'Comment',
            share: 'Share',
            download: 'Download',
            showMore: 'Show more',
            showLess: 'Show less',
            loadFullHistory: 'Load full history',
            showingEntries: (current: number, total: number) => `Showing ${current} of ${total} records`,
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
                    imageUrl: '/aluminum-joinery.webp',
                    link: '/services/joinery.html',
                },
                {
                    id: 'solar',
                    title: 'Zonne-energie Systemen',
                    description: 'Bereik superieure energie-efficiëntie met onze geïntegreerde zonne-oplossingen voor commerciële en residentiële panden.',
                    icon: 'solar_power',
                    imageUrl: '/solar-pv-systems.png',
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
                    imageUrl: '/epdm-roofing.jpeg',
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
                    imageUrl: '/epdm-roofing.jpeg',
                },
                {
                    id: 'p5',
                    title: 'Premium Raaminstallatie',
                    category: 'Aluminium Schrijnwerk',
                    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                },
            ],
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
                phonePlaceholder: '+32 492 80 13 53',
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
                address: 'België',
                phone: '+32 492 80 13 53',
                email: 'info@oxservices.com',
            },
            copyright: '© 2024 OX Services. Alle rechten voorbehouden.',
        },
        chat: {
            assistantName: 'OX Services Assistent',
            onlineStatus: 'Nu online',
            inputPlaceholder: 'Typ uw bericht...',
            needHelp: '💬 Hulp nodig?',
            openChat: 'Open AI chat',
            closeChat: 'Chat sluiten',
            initialMessage: 'Hallo! 👋 Ik ben de virtuele assistent van OX Services. Hoe kan ik u vandaag helpen? Welk type dienst zoekt u?',
            errorMessage: 'Sorry, er is een fout opgetreden. Probeer het opnieuw of neem contact met ons op via WhatsApp.',
            fallbackGeneral: 'Begrepen! Wij bieden de volgende diensten aan:\n\n• **Aluminium Schrijnwerk** - Ramen en deuren\n• **Zonne-energie** - PV-systemen\n• **Maatwerk Meubels** - Op maat ontwerp\n• **EPDM Dakbedekking** - Waterdichting\n\nWelke van deze diensten interesseert u? Of vertel me meer over uw project!',
        },
        workpage: {
            progressTitle: 'Werkvoortgang',
            timelineTitle: 'Werk Tijdlijn',
            commentsTitle: 'Opmerkingen en Observaties',
            shareTitle: 'Toegang Delen',
            infoTitle: 'Werk Informatie',
            daysWorked: 'Dagen gewerkt',
            photosRecorded: "Foto's opgenomen",
            videos: "Video's",
            daysRemaining: 'Dagen resterend',
            totalDays: 'totale dagen',
            startDate: 'Startdatum',
            endDate: 'Verwachte voltooiing',
            lastUpdate: 'Laatste update',
            teamResponsible: 'Verantwoordelijk team',
            shareDescription: 'Deel deze link met anderen zodat ze het werk in realtime kunnen volgen:',
            copyLink: 'Link Kopiëren',
            linkCopied: 'Link gekopieerd!',
            accessToken: 'Toegangstoken',
            client: 'Klant',
            status: 'Status',
            period: 'Periode',
            loading: 'Werkgegevens laden...',
            preparing: 'Digitale bouwplaats voorbereiden',
            workNotFound: 'Werk niet gevonden',
            workNotFoundDescription: 'Het toegangstoken is mogelijk onjuist or dit werk is niet meer beschikbaar. Controleer de link of neem contact op met het werkteam.',
            backToHome: 'Terug naar startpagina',
            tryAgain: 'Opnieuw proberen',
            statusLabels: {
                in_progress: '🏗️ In uitvoering',
                planned: '📅 Gepland',
                completed: '✅ Voltooid',
            },
            records: (count: number) => `${count} ${count === 1 ? 'record' : 'records'}`,
            commentsCount: (count: number) => `${count} ${count === 1 ? 'opmerking' : 'opmerkingen'}`,
            today: 'Vandaag',
            moreDetails: 'Meer details',
            lessDetails: 'Minder details',
            totalPhotos: "Totaal foto's",
            totalVideos: "Totaal video's",
            totalNotes: 'Totaal notities',
            shareOnWhatsApp: 'Delen via WhatsApp',
            followWorkProgress: 'Volg de werkvoortgang:',
            installApp: 'App Installeren',
            installAppDescription: 'Voeg toe aan startscherm voor snelle toegang en updatemeldingen.',
            youAreOffline: 'Je bent offline',
            dataOutdated: 'Sommige gegevens kunnen verouderd zijn',
        },
        comments: {
            title: 'Opmerkingen en Feedback',
            commentsCount: (count: number) => `${count} ${count === 1 ? 'opmerking' : 'opmerkingen'}`,
            likesCount: (count: number) => `${count} likes`,
            addComment: 'Opmerking Toevoegen',
            yourName: 'Uw naam *',
            yourEmail: 'Uw e-mail (optioneel)',
            yourComment: 'Uw opmerking *',
            submitComment: 'Opmerking Versturen',
            submitting: 'Versturen...',
            submitted: '✓ Verzonden!',
            approvalNote: 'Uw opmerking zal zichtbaar zijn na goedkeuring door het team.',
            sortRecent: 'Meest recent',
            sortPopular: 'Meest populair',
            sortOldest: 'Oudste',
            verified: 'Geverifieerd',
            awaitingApproval: 'Wachtend op goedkeuring',
            minutesAgo: (mins: number) => `${mins} min geleden`,
            hoursAgo: (hours: number) => `${hours} uur geleden`,
            daysAgo: (days: number) => `${days} dagen geleden`,
            yesterday: 'Gisteren',
            like: 'Like',
            liked: 'Geliked',
            reply: 'Antwoorden',
            share: 'Delen',
            report: 'Rapporteren',
            noComments: 'Nog geen opmerkingen',
            noCommentsDescription: 'Wees de eerste om uw observaties over de voortgang van dit werk te delen.',
            replies: (count: number) => `${count} ${count === 1 ? 'antwoord' : 'antwoorden'}`,
            showReplies: 'Antwoorden tonen',
            hideReplies: 'Antwoorden verbergen',
        },
        timeline: {
            emptyTitle: 'Lege Tijdlijn',
            emptyDescription: 'Er zijn nog geen records in dit werk. Het eerste record verschijnt hier wanneer het team de voortgang begint te documenteren.',
            photo: 'Foto',
            video: 'Video',
            note: 'Notitie',
            record: 'Record',
            today: 'Vandaag',
            yesterday: 'Gisteren',
            daysAgo: (days: number) => `${days} dagen geleden`,
            like: 'Like',
            liked: 'Geliked',
            comment: 'Opmerking',
            share: 'Delen',
            download: 'Downloaden',
            showMore: 'Meer tonen',
            showLess: 'Minder tonen',
            loadFullHistory: 'Volledige geschiedenis laden',
            showingEntries: (current: number, total: number) => `Toont ${current} van ${total} records`,
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
                    imageUrl: '/aluminum-joinery.webp',
                    link: '/services/joinery.html',
                },
                {
                    id: 'solar',
                    title: 'Sistemas Solares Fotovoltaicos',
                    description: 'Logre una eficiencia energética superior con nuestras soluciones solares integradas para propiedades comerciales y residenciales.',
                    icon: 'solar_power',
                    imageUrl: '/solar-pv-systems.png',
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
                    imageUrl: '/epdm-roofing.jpeg',
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
                    imageUrl: '/epdm-roofing.jpeg',
                },
                {
                    id: 'p5',
                    title: 'Instalación de Ventanas Premium',
                    category: 'Carpintería de Aluminio',
                    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                },
            ],
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
                phonePlaceholder: '+32 492 80 13 53',
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
                address: 'Bélgica',
                phone: '+32 492 80 13 53',
                email: 'info@oxservices.com',
            },
            copyright: '© 2024 OX Services. Todos los derechos reservados.',
        },
        chat: {
            assistantName: 'Asistente OX Services',
            onlineStatus: 'En línea ahora',
            inputPlaceholder: 'Escribe tu mensaje...',
            needHelp: '💬 ¿Necesitas ayuda?',
            openChat: 'Abrir chat de IA',
            closeChat: 'Cerrar chat',
            initialMessage: '¡Hola! 👋 Soy el asistente virtual de OX Services. ¿Cómo puedo ayudarte hoy? ¿Qué tipo de servicio estás buscando?',
            errorMessage: 'Lo siento, ocurrió un error. Por favor, inténtalo de nuevo o contáctanos por WhatsApp.',
            fallbackGeneral: '¡Entendido! Ofrecemos los siguientes servicios:\n\n• **Carpintería de Aluminio** - Ventanas y puertas\n• **Energía Solar** - Sistemas fotovoltaicos\n• **Muebles a Medida** - Diseño exclusivo\n• **Techos EPDM** - Impermeabilización\n\n¿Cuál de estos servicios te interesa? ¡O cuéntame más sobre tu proyecto!',
        },
        workpage: {
            progressTitle: 'Progreso del Trabajo',
            timelineTitle: 'Línea de Tiempo del Trabajo',
            commentsTitle: 'Comentarios y Observaciones',
            shareTitle: 'Compartir Acceso',
            infoTitle: 'Información del Trabajo',
            daysWorked: 'Días trabajados',
            photosRecorded: 'Fotos registradas',
            videos: 'Videos',
            daysRemaining: 'Días restantes',
            totalDays: 'días totales',
            startDate: 'Fecha de inicio',
            endDate: 'Finalización estimada',
            lastUpdate: 'Última actualización',
            teamResponsible: 'Equipo responsable',
            shareDescription: 'Comparte este enlace con otros para que puedan seguir el trabajo en tiempo real:',
            copyLink: 'Copiar Enlace',
            linkCopied: '¡Enlace copiado!',
            accessToken: 'Token de acceso',
            client: 'Cliente',
            status: 'Estado',
            period: 'Período',
            loading: 'Cargando datos del trabajo...',
            preparing: 'Preparando el sitio de construcción digital',
            workNotFound: 'Trabajo no encontrado',
            workNotFoundDescription: 'El token de acceso puede ser incorrecto o este trabajo ya no está disponible. Verifica el enlace o contacta al equipo de trabajo.',
            backToHome: 'Volver a la página principal',
            tryAgain: 'Intentar de nuevo',
            statusLabels: {
                in_progress: '🏗️ En progreso',
                planned: '📅 Planificado',
                completed: '✅ Completado',
            },
            records: (count: number) => `${count} ${count === 1 ? 'registro' : 'registros'}`,
            commentsCount: (count: number) => `${count} ${count === 1 ? 'comentario' : 'comentarios'}`,
            today: 'Hoy',
            moreDetails: 'Más detalles',
            lessDetails: 'Menos detalles',
            totalPhotos: 'Total de fotos',
            totalVideos: 'Total de videos',
            totalNotes: 'Total de notas',
            shareOnWhatsApp: 'Compartir en WhatsApp',
            followWorkProgress: 'Sigue el progreso del trabajo:',
            installApp: 'Instalar App',
            installAppDescription: 'Añadir a la pantalla de inicio para acceso rápido y notificaciones de actualizaciones.',
            youAreOffline: 'Estás sin conexión',
            dataOutdated: 'Algunos datos pueden estar desactualizados',
        },
        comments: {
            title: 'Comentarios y Retroalimentación',
            commentsCount: (count: number) => `${count} ${count === 1 ? 'comentario' : 'comentarios'}`,
            likesCount: (count: number) => `${count} me gusta`,
            addComment: 'Agregar Comentario',
            yourName: 'Tu nombre *',
            yourEmail: 'Tu correo (opcional)',
            yourComment: 'Tu comentario *',
            submitComment: 'Enviar Comentario',
            submitting: 'Enviando...',
            submitted: '✓ ¡Enviado!',
            approvalNote: 'Tu comentario será visible después de la aprobación del equipo.',
            sortRecent: 'Más recientes',
            sortPopular: 'Más populares',
            sortOldest: 'Más antiguos',
            verified: 'Verificado',
            awaitingApproval: 'Esperando aprobación',
            minutesAgo: (mins: number) => `hace ${mins} min`,
            hoursAgo: (hours: number) => `hace ${hours} h`,
            daysAgo: (days: number) => `hace ${days} días`,
            yesterday: 'Ayer',
            like: 'Me gusta',
            liked: 'Me gusta',
            reply: 'Responder',
            share: 'Compartir',
            report: 'Reportar',
            noComments: 'Aún no hay comentarios',
            noCommentsDescription: 'Sé el primero en compartir tus observaciones sobre el progreso de este trabajo.',
            replies: (count: number) => `${count} ${count === 1 ? 'respuesta' : 'respuestas'}`,
            showReplies: 'Mostrar respuestas',
            hideReplies: 'Ocultar respuestas',
        },
        timeline: {
            emptyTitle: 'Línea de Tiempo Vacía',
            emptyDescription: 'No hay registros en este trabajo todavía. El primer registro aparecerá aquí cuando el equipo comience a documentar el progreso.',
            photo: 'Foto',
            video: 'Video',
            note: 'Nota',
            record: 'Registro',
            today: 'Hoy',
            yesterday: 'Ayer',
            daysAgo: (days: number) => `hace ${days} días`,
            like: 'Me gusta',
            liked: 'Me gusta',
            comment: 'Comentario',
            share: 'Compartir',
            download: 'Descargar',
            showMore: 'Mostrar más',
            showLess: 'Mostrar menos',
            loadFullHistory: 'Cargar historial completo',
            showingEntries: (current: number, total: number) => `Mostrando ${current} de ${total} registros`,
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
                    imageUrl: '/aluminum-joinery.webp',
                    link: '/services/joinery.html',
                },
                {
                    id: 'solar',
                    title: 'Systèmes Solaires Photovoltaïques',
                    description: 'Atteignez une efficacité énergétique supérieure avec nos solutions solaires intégrées pour propriétés commerciales et résidentielles.',
                    icon: 'solar_power',
                    imageUrl: '/solar-pv-systems.png',
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
                    imageUrl: '/epdm-roofing.jpeg',
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
                    imageUrl: '/epdm-roofing.jpeg',
                },
                {
                    id: 'p5',
                    title: 'Installation de Fenêtres Premium',
                    category: 'Menuiserie Aluminium',
                    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                },
            ],
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
                phonePlaceholder: '+32 492 80 13 53',
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
                address: 'Belgique',
                phone: '+32 492 80 13 53',
                email: 'info@oxservices.com',
            },
            copyright: '© 2024 OX Services. Tous droits réservés.',
        },
        chat: {
            assistantName: 'Assistant OX Services',
            onlineStatus: 'En ligne maintenant',
            inputPlaceholder: 'Tapez votre message...',
            needHelp: '💬 Besoin d\'aide?',
            openChat: 'Ouvrir le chat IA',
            closeChat: 'Fermer le chat',
            initialMessage: 'Bonjour! 👋 Je suis l\'assistant virtuel d\'OX Services. Comment puis-je vous aider aujourd\'hui? Quel type de service recherchez-vous?',
            errorMessage: 'Désolé, une erreur s\'est produite. Veuillez réessayer ou nous contacter via WhatsApp.',
            fallbackGeneral: 'Compris! Nous offrons les services suivants:\n\n• **Menuiserie Aluminium** - Fenêtres et portes\n• **Énergie Solaire** - Systèmes PV\n• **Mobilier Sur Mesure** - Design exclusif\n• **Toiture EPDM** - Étanchéité\n\nLequel de ces services vous intéresse? Ou parlez-moi de votre projet!',
        },
        workpage: {
            progressTitle: 'Progression du Travail',
            timelineTitle: 'Chronologie du Travail',
            commentsTitle: 'Commentaires et Observations',
            shareTitle: 'Partager l\'Accès',
            infoTitle: 'Informations du Travail',
            daysWorked: 'Jours travaillés',
            photosRecorded: 'Photos enregistrées',
            videos: 'Vidéos',
            daysRemaining: 'Jours restants',
            totalDays: 'jours totaux',
            startDate: 'Date de début',
            endDate: 'Fin estimée',
            lastUpdate: 'Dernière mise à jour',
            teamResponsible: 'Équipe responsable',
            shareDescription: 'Partagez ce lien avec d\'autres pour qu\'ils puissent suivre le travail en temps réel:',
            copyLink: 'Copier le Lien',
            linkCopied: 'Lien copié!',
            accessToken: 'Jeton d\'accès',
            client: 'Client',
            status: 'Statut',
            period: 'Période',
            loading: 'Chargement des données du travail...',
            preparing: 'Préparation du chantier numérique',
            workNotFound: 'Travail non trouvé',
            workNotFoundDescription: 'Le jeton d\'accès peut être incorrect ou ce travail n\'est plus disponible. Vérifiez le lien ou contactez l\'équipe de travail.',
            backToHome: 'Retour à la page d\'accueil',
            tryAgain: 'Réessayer',
            statusLabels: {
                in_progress: '🏗️ En cours',
                planned: '📅 Planifié',
                completed: '✅ Terminé',
            },
            records: (count: number) => `${count} ${count === 1 ? 'enregistrement' : 'enregistrements'}`,
            commentsCount: (count: number) => `${count} ${count === 1 ? 'commentaire' : 'commentaires'}`,
            today: 'Aujourd\'hui',
            moreDetails: 'Plus de détails',
            lessDetails: 'Moins de détails',
            totalPhotos: 'Total de photos',
            totalVideos: 'Total de vidéos',
            totalNotes: 'Total de notes',
            shareOnWhatsApp: 'Partager sur WhatsApp',
            followWorkProgress: 'Suivez la progression du travail:',
            installApp: 'Installer l\'App',
            installAppDescription: 'Ajouter à l\'écran d\'accueil pour un accès rapide et des notifications de mises à jour.',
            youAreOffline: 'Vous êtes hors ligne',
            dataOutdated: 'Certaines données peuvent être obsolètes',
        },
        comments: {
            title: 'Commentaires et Retours',
            commentsCount: (count: number) => `${count} ${count === 1 ? 'commentaire' : 'commentaires'}`,
            likesCount: (count: number) => `${count} j\'aime`,
            addComment: 'Ajouter un Commentaire',
            yourName: 'Votre nom *',
            yourEmail: 'Votre email (optionnel)',
            yourComment: 'Votre commentaire *',
            submitComment: 'Envoyer le Commentaire',
            submitting: 'Envoi en cours...',
            submitted: '✓ Envoyé!',
            approvalNote: 'Votre commentaire sera visible après approbation de l\'équipe.',
            sortRecent: 'Plus récents',
            sortPopular: 'Plus populaires',
            sortOldest: 'Plus anciens',
            verified: 'Vérifié',
            awaitingApproval: 'En attente d\'approbation',
            minutesAgo: (mins: number) => `il y a ${mins} min`,
            hoursAgo: (hours: number) => `il y a ${hours} h`,
            daysAgo: (days: number) => `il y a ${days} jours`,
            yesterday: 'Hier',
            like: 'J\'aime',
            liked: 'J\'aime',
            reply: 'Répondre',
            share: 'Partager',
            report: 'Signaler',
            noComments: 'Pas encore de commentaires',
            noCommentsDescription: 'Soyez le premier à partager vos observations sur la progression de ce travail.',
            replies: (count: number) => `${count} ${count === 1 ? 'réponse' : 'réponses'}`,
            showReplies: 'Afficher les réponses',
            hideReplies: 'Masquer les réponses',
        },
        timeline: {
            emptyTitle: 'Chronologie Vide',
            emptyDescription: 'Il n\'y a encore aucun enregistrement dans ce travail. Le premier enregistrement apparaîtra ici lorsque l\'équipe commencera à documenter la progression.',
            photo: 'Photo',
            video: 'Vidéo',
            note: 'Note',
            record: 'Enregistrement',
            today: 'Aujourd\'hui',
            yesterday: 'Hier',
            daysAgo: (days: number) => `il y a ${days} jours`,
            like: 'J\'aime',
            liked: 'J\'aime',
            comment: 'Commentaire',
            share: 'Partager',
            download: 'Télécharger',
            showMore: 'Afficher plus',
            showLess: 'Afficher moins',
            loadFullHistory: 'Charger l\'historique complet',
            showingEntries: (current: number, total: number) => `Affichage de ${current} sur ${total} enregistrements`,
        },
    },
    pt: {
        companyName: 'OX Services',
        navigation: [
            { name: 'Início', href: '#home' },
            { name: 'Serviços', href: '#services' },
            { name: 'Portfólio', href: '#portfolio' },
            { name: 'Contacto', href: '#contact' },
        ],
        ctaButton: 'Pedir Orçamento',
        hero: {
            preHeading: 'Soluções de Infraestrutura Premium',
            heading: 'Construindo a Excelência desde a Base',
            subHeading: 'Com design sofisticado, projetamos e instalamos infraestrutura premium e acabamentos interiores sob medida para a era moderna.',
            primaryAction: 'Pedir Orçamento',
            secondaryAction: 'Ver Portfólio',
            backgroundImageAlt: 'Projeto de construção moderno',
        },
        stats: [
            { value: '500+', label: 'Projetos Concluídos' },
            { value: '15+', label: 'Anos de Experiência' },
            { value: '100%', label: 'Satisfação do Cliente' },
            { value: '50+', label: 'Equipa Especializada' },
        ],
        services: {
            heading: 'A Nossa Especialidade',
            subHeading: 'Soluções especializadas para durabilidade, eficiência e excelência estética em infraestrutura residencial e comercial.',
            viewAll: 'Ver Todos os Serviços',
            items: [
                { id: 'joinery', title: 'Carpintaria e Vidros em Alumínio', description: 'Janelas e portas com desempenho térmico e durabilidade.', icon: 'window', imageUrl: '/aluminum-joinery.webp', link: '/services/joinery.html' },
                { id: 'solar', title: 'Sistemas Solares Fotovoltaicos', description: 'Eficiência energética com soluções solares integradas.', icon: 'solar_power', imageUrl: '/solar-pv-systems.png', link: '/services/solar.html' },
                { id: 'furniture', title: 'Móveis e Portas Sob Medida', description: 'Móveis e peças interiores duráveis e sob medida.', icon: 'chair', imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', link: '/services/furniture.html' },
                { id: 'roofing', title: 'Coberturas em Membrana EPDM', description: 'Membrana EPDM industrial com barreira impermeável.', icon: 'roofing', imageUrl: '/epdm-roofing.jpeg', link: '/services/roofing.html' },
            ],
        },
        portfolio: {
            heading: 'Transformar Espaços, Construir Sonhos',
            subHeading: 'Veja como damos vida a projetos de renovação.',
            projects: [
                { id: 'p1', title: 'Renovação Residencial Completa', category: 'Renovação Total', imageUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=1600&q=80', videoUrl: 'https://res.cloudinary.com/dswtssvkq/video/upload/v1766092988/1218_kli8yz.mp4' },
                { id: 'p2', title: 'Integração Solar Urbana', category: 'Sistemas Solares', imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80' },
                { id: 'p3', title: 'Sala de Reuniões', category: 'Móveis Sob Medida', imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80' },
                { id: 'p4', title: 'Impermeabilização de Cobertura', category: 'EPDM', imageUrl: '/epdm-roofing.jpeg' },
                { id: 'p5', title: 'Instalação de Janelas', category: 'Carpintaria Alumínio', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
            ],
        },

        contact: {
            heading: 'Contacte-nos',
            subHeading: 'Contacte-nos hoje para uma consulta gratuita.',
            form: {
                fullNameLabel: 'Nome completo *',
                fullNamePlaceholder: 'O seu nome',
                companyLabel: 'Empresa',
                companyPlaceholder: 'Nome da empresa',
                emailLabel: 'E-mail *',
                emailPlaceholder: 'seu@email.com',
                phoneLabel: 'Telefone',
                phonePlaceholder: '+32 492 80 13 53',
                messageLabel: 'Mensagem',
                messagePlaceholder: 'Fale-nos do seu projeto...',
                submitButton: 'Enviar Mensagem',
                errors: { nameRequired: 'Nome obrigatório', emailRequired: 'E-mail obrigatório', emailInvalid: 'E-mail inválido', phoneInvalid: 'Telefone inválido' },
                successMessage: 'Obrigado! Entraremos em contacto em breve.',
            },
        },
        footer: {
            about: 'Excelência através de qualidade e soluções inovadoras há mais de 15 anos.',
            quickLinks: { title: 'Links', links: [{ name: 'Início', href: '#home' }, { name: 'Serviços', href: '#services' }, { name: 'Portfólio', href: '#portfolio' }, { name: 'Contacto', href: '#contact' }] },
            services: { title: 'Serviços', links: [{ name: 'Sistemas Solares', href: '/services/solar.html' }, { name: 'Coberturas EPDM', href: '/services/roofing.html' }, { name: 'Carpintaria Alumínio', href: '/services/joinery.html' }, { name: 'Móveis Sob Medida', href: '/services/furniture.html' }] },
            contactInfo: { title: 'Contacto', address: 'Bélgica', phone: '+32 492 80 13 53', email: 'info@oxservices.com' },
            copyright: '© 2024 OX Services. Todos os direitos reservados.',
        },
        chat: {
            assistantName: 'Assistente OX Services',
            onlineStatus: 'Online',
            inputPlaceholder: 'Escreva a sua mensagem...',
            needHelp: '💬 Precisa de ajuda?',
            openChat: 'Abrir chat',
            closeChat: 'Fechar chat',
            initialMessage: 'Olá! 👋 Como posso ajudar? Que tipo de serviço procura?',
            errorMessage: 'Ocorreu um erro. Tente novamente ou contacte-nos via WhatsApp.',
            fallbackGeneral: 'Oferecemos: Carpintaria em alumínio, Energia solar, Móveis sob medida, Coberturas EPDM. Qual destes serviços interessa?',
        },
        workpage: {
            progressTitle: 'Progresso da Obra',
            timelineTitle: 'Timeline da Obra',
            commentsTitle: 'Comentários e Observações',
            shareTitle: 'Partilhar Acesso',
            infoTitle: 'Informação da Obra',
            daysWorked: 'Dias trabalhados',
            photosRecorded: 'Fotos registadas',
            videos: 'Vídeos',
            daysRemaining: 'Dias restantes',
            totalDays: 'dias totais',
            startDate: 'Data de início',
            endDate: 'Conclusão prevista',
            lastUpdate: 'Última atualização',
            teamResponsible: 'Equipa responsável',
            shareDescription: 'Partilhe este link para acompanhar a obra em tempo real:',
            copyLink: 'Copiar link',
            linkCopied: 'Link copiado!',
            accessToken: 'Token de acesso',
            client: 'Cliente',
            status: 'Estado',
            period: 'Período',
            loading: 'A carregar...',
            preparing: 'A preparar o estaleiro digital',
            workNotFound: 'Obra não encontrada',
            workNotFoundDescription: 'O token pode estar incorreto ou a obra não está disponível.',
            backToHome: 'Voltar ao início',
            tryAgain: 'Tentar novamente',
            statusLabels: { in_progress: '🏗️ Em progresso', planned: '📅 Planeado', completed: '✅ Concluído' },
            records: (count: number) => `${count} ${count === 1 ? 'registo' : 'registos'}`,
            commentsCount: (count: number) => `${count} ${count === 1 ? 'comentário' : 'comentários'}`,
            today: 'Hoje',
            moreDetails: 'Mais detalhes',
            lessDetails: 'Menos detalhes',
            totalPhotos: 'Total de fotos',
            totalVideos: 'Total de vídeos',
            totalNotes: 'Total de notas',
            shareOnWhatsApp: 'Partilhar no WhatsApp',
            followWorkProgress: 'Acompanhar o progresso:',
            installApp: 'Instalar App',
            installAppDescription: 'Adicione ao ecrã inicial para acesso rápido.',
            youAreOffline: 'Está offline',
            dataOutdated: 'Alguns dados podem estar desatualizados',
        },
        comments: {
            title: 'Comentários e Feedback',
            commentsCount: (count: number) => `${count} ${count === 1 ? 'comentário' : 'comentários'}`,
            likesCount: (count: number) => `${count} gostos`,
            addComment: 'Adicionar Comentário',
            yourName: 'O seu nome *',
            yourEmail: 'O seu e-mail (opcional)',
            yourComment: 'O seu comentário *',
            submitComment: 'Enviar Comentário',
            submitting: 'A enviar...',
            submitted: '✓ Enviado!',
            approvalNote: 'O seu comentário será visível após aprovação.',
            sortRecent: 'Mais recentes',
            sortPopular: 'Mais populares',
            sortOldest: 'Mais antigos',
            verified: 'Verificado',
            awaitingApproval: 'A aguardar aprovação',
            minutesAgo: (mins: number) => `${mins} min atrás`,
            hoursAgo: (hours: number) => `${hours} h atrás`,
            daysAgo: (days: number) => `${days} dias atrás`,
            yesterday: 'Ontem',
            like: 'Gostar',
            liked: 'Gostei',
            reply: 'Responder',
            share: 'Partilhar',
            report: 'Reportar',
            noComments: 'Ainda sem comentários',
            noCommentsDescription: 'Seja o primeiro a partilhar observações sobre esta obra.',
            replies: (count: number) => `${count} ${count === 1 ? 'resposta' : 'respostas'}`,
            showReplies: 'Mostrar respostas',
            hideReplies: 'Ocultar respostas',
        },
        timeline: {
            emptyTitle: 'Timeline Vazia',
            emptyDescription: 'Ainda não há registos nesta obra.',
            photo: 'Foto',
            video: 'Vídeo',
            note: 'Nota',
            record: 'Registo',
            today: 'Hoje',
            yesterday: 'Ontem',
            daysAgo: (days: number) => `${days} dias atrás`,
            like: 'Gostar',
            liked: 'Gostei',
            comment: 'Comentário',
            share: 'Partilhar',
            download: 'Descarregar',
            showMore: 'Mostrar mais',
            showLess: 'Mostrar menos',
            loadFullHistory: 'Carregar histórico completo',
            showingEntries: (current: number, total: number) => `A mostrar ${current} de ${total} registos`,
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
        if (savedLang && ['en', 'nl', 'es', 'fr', 'pt'].includes(savedLang)) {
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
    pt: 'Português',
};

export const languageFlags: Record<Language, string> = {
    en: '/flags/gb.svg',
    nl: '/flags/nl.svg',
    es: '/flags/es.svg',
    fr: '/flags/fr.svg',
    pt: '/flags/pt.svg',
};
