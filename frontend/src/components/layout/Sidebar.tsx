import React from 'react';
import {
  LayoutDashboard,
  Plane,
  BookOpen,
  TrendingUp,
  LogOut,
  Sprout
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export type NavigationTab = 'dashboard' | 'drone' | 'khata' | 'market';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'drone', label: t('nav_drone', 'Drone Studio'), icon: Plane },
    { id: 'khata', label: t('nav_khata', 'Farm Khata'), icon: BookOpen },
    { id: 'market', label: t('nav_market', 'Mandi & Weather'), icon: TrendingUp },
  ] as const;

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-icon">
          <Sprout size={22} />
        </div>
        <div>
          <div className="brand-title">
            Farming Assist
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {t('brand_subtitle', 'Next-Gen Agritech OS')}
          </div>
        </div>
      </div>

      {/* Navigation Menu with Active Indicator */}
      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      {user && (
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="user-avatar">
                {user.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.full_name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {user.district || 'Nagpur'}, {user.state || 'MH'}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              title={t('logout', 'Logout')}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

