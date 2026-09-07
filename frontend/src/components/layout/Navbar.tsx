import React, { useEffect, useState } from 'react';
import type { NavigationTab } from './Sidebar';
import { ChevronRight, Wind, CloudRain, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import type { WeatherAdvisory } from '../../services/types';

interface NavbarProps {
  currentTab: NavigationTab;
  plotName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, plotName = "North Cotton Plot" }) => {
  const [advisory, setAdvisory] = useState<WeatherAdvisory | null>(null);

  useEffect(() => {
    api.getWeatherAdvisory().then(setAdvisory).catch(() => {});
  }, []);

  const tabLabels: Record<NavigationTab, string> = {
    dashboard: 'Farm Overview & Thermal GDD',
    drone: 'Drone Ingestion & Vision Plant Doctor',
    khata: 'Double-Entry Farm Ledger & KCC',
    market: 'Live APMC Mandi Rates & Spray Forecast',
  };

  const renderSprayBadge = () => {
    if (!advisory) return null;
    const status = advisory.spray_status;

    if (status === 'OPTIMAL') {
      return (
        <div className="badge badge-success" title={advisory.spray_rationale}>
          <CheckCircle size={14} />
          <span>Optimal Spray Window</span>
        </div>
      );
    } else if (status === 'CAUTION_WIND') {
      return (
        <div className="badge badge-warning" title={advisory.spray_rationale}>
          <Wind size={14} />
          <span>Caution: Wind Drift</span>
        </div>
      );
    } else {
      return (
        <div className="badge badge-critical" title={advisory.spray_rationale}>
          <CloudRain size={14} />
          <span>No Spray: Wash-off Risk</span>
        </div>
      );
    }
  };

  return (
    <header className="top-navbar">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span>Krishi-Khata</span>
        <ChevronRight size={14} />
        <span className="current">{tabLabels[currentTab]}</span>
      </div>

      {/* Quick Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Spray Condition Badge */}
        {renderSprayBadge()}

        {/* Active Farm Plot Tag */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 14px',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald-primary)', boxShadow: '0 0 8px var(--emerald-primary)' }}></span>
          <span>{plotName}</span>
        </div>
      </div>
    </header>
  );
};
