import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Sidebar } from './components/layout/Sidebar';
import type { NavigationTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { DroneStudio } from './pages/DroneStudio';
import { KhataPage } from './pages/KhataPage';
import { MandiWeatherPage } from './pages/MandiWeatherPage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-canvas)',
        color: 'var(--brand-primary)',
        fontFamily: 'var(--font-sans)',
        fontSize: '1.2rem',
        fontWeight: 600,
        gap: '12px'
      }}>
        <div className="brand-icon animate-radar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
        <span>{t('initializing', 'Initializing Krishi-Khata 2.0 Operating System...')}</span>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const plotName = user.plots && user.plots.length > 0 ? user.plots[0].name : "Farmer's Field";

  return (
    <div className="app-container">
      {/* Sidebar with dynamic active route indicator */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Workspace Area */}
      <div className="main-wrapper">
        <Navbar currentTab={currentTab} plotName={plotName} />

        <main style={{ flex: 1 }}>
          {currentTab === 'dashboard' && <Dashboard onNavigateTab={setCurrentTab} />}
          {currentTab === 'drone' && <DroneStudio />}
          {currentTab === 'khata' && <KhataPage />}
          {currentTab === 'market' && <MandiWeatherPage />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;

