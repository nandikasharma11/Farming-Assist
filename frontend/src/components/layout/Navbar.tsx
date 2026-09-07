import React, { useEffect, useState } from 'react';
import type { NavigationTab } from './Sidebar';
import { ChevronRight, Wind, CloudRain, CheckCircle, Sun, Moon, Globe } from 'lucide-react';
import { api } from '../../services/api';
import type { WeatherAdvisory } from '../../services/types';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { SupportedLanguage } from '../../i18n/translations';

interface NavbarProps {
  currentTab: NavigationTab;
  plotName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, plotName = "North Cotton Plot" }) => {
  const [advisory, setAdvisory] = useState<WeatherAdvisory | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, languages } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    api.getWeatherAdvisory().then(setAdvisory).catch(() => {});
  }, []);

  const tabLabels: Record<NavigationTab, string> = {
    dashboard: t('nav_dashboard', 'Dashboard'),
    drone: t('nav_drone', 'Drone Studio'),
    khata: t('nav_khata', 'Farm Khata'),
    market: t('nav_market', 'Mandi & Weather'),
  };

  const renderSprayBadge = () => {
    if (!advisory) return null;
    const status = advisory.spray_status;

    if (status === 'OPTIMAL') {
      return (
        <div className="badge badge-success" title={advisory.spray_rationale}>
          <CheckCircle size={14} />
          <span>{t('spray_optimal', 'Optimal Spray Window')}</span>
        </div>
      );
    } else if (status === 'CAUTION_WIND') {
      return (
        <div className="badge badge-warning" title={advisory.spray_rationale}>
          <Wind size={14} />
          <span>{t('spray_wind', 'Caution: Wind Drift')}</span>
        </div>
      );
    } else {
      return (
        <div className="badge badge-critical" title={advisory.spray_rationale}>
          <CloudRain size={14} />
          <span>{t('spray_rain', 'No Spray: Wash-off Risk')}</span>
        </div>
      );
    }
  };

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  return (
    <header className="top-navbar">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span>Farming Assist</span>
        <ChevronRight size={14} />
        <span className="current">{tabLabels[currentTab]}</span>
      </div>

      {/* Quick Status & Control Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Spray Condition Badge */}
        {renderSprayBadge()}

        {/* Active Farm Plot Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 14px',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--brand-primary)',
            boxShadow: '0 0 8px var(--brand-primary)'
          }}></span>
          <span>{plotName}</span>
        </div>

        {/* Indian Language Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangMenu(prev => !prev)}
            title="Select Language / भाषा चुनें"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 12px',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Globe size={15} style={{ color: 'var(--palette-2)' }} />
            <span style={{ fontWeight: 600 }}>{currentLangObj.nativeName}</span>
          </button>

          {showLangMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '180px',
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border-hover)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100,
                overflow: 'hidden',
                padding: '4px'
              }}
            >
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code as SupportedLanguage);
                    setShowLangMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: language === l.code ? 'var(--brand-dim)' : 'transparent',
                    border: 'none',
                    color: language === l.code ? 'var(--brand-primary)' : 'var(--text-primary)',
                    fontWeight: language === l.code ? 700 : 400,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background var(--transition-fast)'
                  }}
                >
                  <span>{l.nativeName}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? t('theme_light', 'Switch to Light Mode') : t('theme_dark', 'Switch to Dark Mode')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {theme === 'dark' ? (
            <Sun size={17} style={{ color: '#f59e0b' }} />
          ) : (
            <Moon size={17} style={{ color: 'var(--palette-3)' }} />
          )}
        </button>
      </div>
    </header>
  );
};

