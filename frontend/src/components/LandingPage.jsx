import React, { useState } from 'react';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import ImpactSection from './ImpactSection';
import PortalsSection from './PortalsSection';
import LandingFooter from './LandingFooter';
import AuthModal from './AuthModal';

export default function LandingPage({ onEnterPortal }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState('rural');
  const [authMode, setAuthMode] = useState('login');

  const handleOpenAuth = (role = 'rural', mode = 'login') => {
    setAuthRole(role);
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleAuthenticate = (userData) => {
    setAuthOpen(false);
    onEnterPortal(userData.role);
  };

  const handleNavigateSection = (sectionId) => {
    if (sectionId === 'ngo') {
      onEnterPortal('ngo');
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {/* Fixed Navigation Bar */}
      <LandingNavbar
        onOpenAuth={handleOpenAuth}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Sections */}
      <main>
        <HeroSection
          onOpenAuth={handleOpenAuth}
          onNavigateSection={handleNavigateSection}
        />
        <ImpactSection />
        <PortalsSection
          onOpenAuth={handleOpenAuth}
          onDirectPortalLaunch={onEnterPortal}
        />
      </main>

      {/* Deep Blue Footer */}
      <LandingFooter />

      {/* State-Managed Authentication Dialog */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultRole={authRole}
        defaultMode={authMode}
        onAuthenticate={handleAuthenticate}
      />
    </div>
  );
}
