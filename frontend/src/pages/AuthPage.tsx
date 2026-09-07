import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, ArrowRight, ShieldCheck, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import type { SupportedLanguage } from '../i18n/translations';

export const AuthPage: React.FC = () => {
  const { login, signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, languages } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [emailOrPhone, setEmailOrPhone] = useState('ramesh@krishikhata.com');
  const [password, setPassword] = useState('FarmerPass123!');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Nagpur');

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email_or_phone: emailOrPhone, password });
      } else {
        await signup({
          full_name: fullName,
          email,
          phone,
          password,
          state,
          district,
          preferred_language: language,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoFarmer = async () => {
    setError(null);
    setLoading(true);
    try {
      // Attempt login with seeded demo account or register if not existing
      await login({
        email_or_phone: 'ramesh@krishikhata.com',
        password: 'FarmerPass123!'
      });
    } catch {
      // Register demo farmer
      try {
        await signup({
          full_name: 'Ramesh Patel',
          email: 'ramesh@krishikhata.com',
          phone: '9876543210',
          password: 'FarmerPass123!',
          state: 'Maharashtra',
          district: 'Nagpur',
          preferred_language: language,
        });
      } catch (err: any) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Controls: Theme & Indian Language Toggle */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 50
      }}>
        {/* Language selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangMenu(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <Globe size={15} style={{ color: 'var(--palette-2)' }} />
            <span style={{ fontWeight: 600 }}>{currentLangObj.nativeName}</span>
          </button>

          {showLangMenu && (
            <div style={{
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
            }}>
              {languages.map(l => (
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
                    textAlign: 'left'
                  }}
                >
                  <span>{l.nativeName}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{l.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme button */}
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
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? (
            <Sun size={17} style={{ color: '#f59e0b' }} />
          ) : (
            <Moon size={17} style={{ color: 'var(--palette-3)' }} />
          )}
        </button>
      </div>

      {/* Ambient Glows */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(2, 123, 127, 0.2) 0%, transparent 70%)',
        top: '15%',
        left: '20%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(88, 164, 167, 0.15) 0%, transparent 70%)',
        bottom: '10%',
        right: '20%',
        pointerEvents: 'none'
      }} />

      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '36px', zIndex: 10 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, var(--palette-3), var(--palette-4))',
            borderRadius: '16px',
            color: '#fff',
            boxShadow: 'var(--brand-glow-sm)',
            marginBottom: '16px'
          }}>
            <Sprout size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Krishi-Khata <span style={{ color: 'var(--brand-primary)' }}>2.0</span>
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {isLogin ? 'Sign in to access your farm ledger & drone diagnostic studio' : 'Create a new farmer operating account'}
          </p>
        </div>

        {/* Toggle Pills */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px',
          marginBottom: '24px',
          border: '1px solid var(--glass-border)'
        }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              background: isLogin ? 'var(--brand-dim)' : 'transparent',
              color: isLogin ? 'var(--brand-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Farmer Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              background: !isLogin ? 'var(--brand-dim)' : 'transparent',
              color: !isLogin ? 'var(--brand-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            New Registration
          </button>
        </div>

        {error && (
          <div style={{
            background: 'var(--crimson-dim)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLogin ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Mobile Phone or Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="e.g. 9876543210 or ramesh@krishikhata.com"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  className="glass-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Farmer Full Name
                </label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ramesh Patel"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="glass-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@agro.com"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    className="glass-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    District
                  </label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Nagpur"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  className="glass-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Enter Farm Operating System' : 'Create Account & Start Farm Plot')}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Instant Demo Sandbox Access */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={loadDemoFarmer}
            disabled={loading}
            className="btn-secondary"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <ShieldCheck size={16} style={{ color: 'var(--emerald-primary)' }} />
            <span>Instant Demo Farmer Login (Ramesh Patel)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
