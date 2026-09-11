import React, { useState } from 'react';
import { Bell, ArrowLeft, Home } from 'lucide-react';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import RuralClinic from './components/RuralClinic';
import UrbanSpecialist from './components/UrbanSpecialist';
import NGODashboard from './components/NGODashboard';
import {
  initialPatients,
  initialReferralCases,
  initialActivities,
} from './data/mockData';

export default function App() {
  // 'landing' | 'rural' | 'specialist' | 'ngo'
  const [currentView, setCurrentView] = useState('landing');
  const [recentPatients, setRecentPatients] = useState(initialPatients);
  const [referralCases, setReferralCases] = useState(initialReferralCases);
  const [activities, setActivities] = useState(initialActivities);

  const pendingUrgentCount = referralCases.filter(
    (c) => c.actionStatus === 'Pending Review'
  ).length;

  const handleSendToSpecialist = (newCase) => {
    setReferralCases((prev) => {
      const exists = prev.some((c) => c.id === newCase.id);
      if (exists) return prev;
      return [newCase, ...prev];
    });

    setActivities((prev) => [
      {
        id: Date.now(),
        time: 'Just now',
        type: newCase.status === 'REVIEW' ? 'alert' : 'upload',
        title: `Referral escalated for ${newCase.name} (${newCase.id})`,
        description: `Transferred from ${newCase.clinic} to Bangalore Craniofacial Center Specialist Queue`,
      },
      ...prev,
    ]);
  };

  const handleLogActivity = (newActivity) => {
    setActivities((prev) => [
      {
        id: Date.now(),
        time: 'Just now',
        ...newActivity,
      },
      ...prev,
    ]);
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'rural':
        return 'Rural Clinic Portal - Primary Care Unit';
      case 'specialist':
        return 'Urban Specialist Review Queue - Second Opinion Node';
      case 'ngo':
        return 'Smile Train Karnataka - Regional Program Analytics';
      default:
        return 'CleftGuard AI';
    }
  };

  // If in landing mode, show the full public Landing Page
  if (currentView === 'landing') {
    return (
      <LandingPage
        onEnterPortal={(targetPortal) => setCurrentView(targetPortal || 'rural')}
      />
    );
  }

  // Otherwise, render the role-based clinical dashboard shell
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        pendingCount={pendingUrgentCount}
        onReturnHome={() => setCurrentView('landing')}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Clean Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('landing')}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-brand-blue transition cursor-pointer"
              title="Return to Public Website"
            >
              <Home className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-semibold text-brand-blue bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
              Tele-Radiology Network
            </span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs font-medium text-slate-600">
              {getViewTitle()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Indicator */}
            <div className="relative p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition cursor-pointer">
              <Bell className="w-4 h-4" />
              {pendingUrgentCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Clinician Profile */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-brand-sky/10 border border-brand-sky/30 text-brand-blue font-bold flex items-center justify-center text-xs">
                DS
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  Dr. A. Sharma
                </div>
                <div className="text-[10px] text-slate-400">Dharwad CHC</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-8 max-w-7xl w-full mx-auto flex-1 flex flex-col justify-between">
          <div>
            {currentView === 'rural' && (
              <RuralClinic
                onSendToSpecialist={handleSendToSpecialist}
                recentPatients={recentPatients}
              />
            )}

            {currentView === 'specialist' && (
              <UrbanSpecialist
                cases={referralCases}
                setCases={setReferralCases}
                onLogActivity={handleLogActivity}
              />
            )}

            {currentView === 'ngo' && (
              <NGODashboard activities={activities} />
            )}
          </div>

          {/* Global Subtle Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
            CleftGuard AI is a prototype for demonstration purposes. Not for clinical diagnosis.
          </footer>
        </div>
      </main>
    </div>
  );
}
