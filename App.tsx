
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import ServicesSection from './components/ServicesSection';
import PortfolioGrid from './components/PortfolioGrid';
import CtaSection from './components/CtaSection';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AIChatWidget from './components/AIChatWidget';
import { useLanguage } from './context/LanguageContext';

const App: React.FC = () => {
    const { textData } = useLanguage();

    return (
        <div className="flex flex-col min-h-screen">
            <Header
                companyName={textData.companyName}
                navLinks={textData.navigation}
                ctaButtonText={textData.ctaButton}
            />
            <main className="flex-grow">
                <div id="home">
                    <Hero content={textData.hero} />
                </div>
                <Stats stats={textData.stats} />
                <div id="services">
                    <ServicesSection content={textData.services} />
                </div>
                <div id="portfolio">
                    <PortfolioGrid content={textData.portfolio} />
                </div>
                <CtaSection content={textData.cta} />
                <div id="contact">
                    <ContactForm content={textData.contact} />
                </div>
            </main>
            <Footer content={textData.footer} companyName={textData.companyName} />
            <WhatsAppButton phoneNumber={textData.footer.contactInfo.phone} />
            <AIChatWidget webhookUrl="https://oxservices.org:5678/webhook/oxchat" />
        </div>
    );
};

export default App;
