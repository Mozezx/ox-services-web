
import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import WorkPage from './pages/WorkPage';

const LandingPage: React.FC = () => {
    const { textData } = useLanguage();

    return (
        <>
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
            <AIChatWidget webhookUrl="https://n8n.oxservices.org/webhook/oxchat" />
        </>
    );
};

const App: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#0B242A' }}>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/obra/:token" element={<WorkPage />} />
            </Routes>
        </div>
    );
};

export default App;
