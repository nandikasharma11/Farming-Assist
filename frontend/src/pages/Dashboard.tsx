import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Crop, FarmPlot, GDDCalculation, KhataSummary, WeatherAdvisory } from '../services/types';
import { GDDGauge } from '../components/agronomy/GDDGauge';
import { Sprout, MapPin, DollarSign, Wind, Plane, RefreshCw, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DashboardProps {
  onNavigateTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
  const { t } = useLanguage();
  const [plots, setPlots] = useState<FarmPlot[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [gddData, setGddData] = useState<GDDCalculation | null>(null);
  const [khataSummary, setKhataSummary] = useState<KhataSummary | null>(null);
  const [weather, setWeather] = useState<WeatherAdvisory | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [fetchedPlots, fetchedCrops, fetchedSummary, fetchedWeather] = await Promise.all([
        api.getPlots(),
        api.getCrops(),
        api.getSummary(),
        api.getWeatherAdvisory(),
      ]);

      setPlots(fetchedPlots);
      setCrops(fetchedCrops);
      setKhataSummary(fetchedSummary);
      setWeather(fetchedWeather);

      // Auto-select first crop or create one if empty
      if (fetchedCrops.length > 0) {
        const crop = fetchedCrops[0];
        setSelectedCrop(crop);
        const gdd = await api.calculateGDD(crop.id);
        setGddData(gdd);
      } else if (fetchedPlots.length > 0) {
        // Register default initial Cotton crop for demo convenience
        const newCrop = await api.createCrop({
          plot_id: fetchedPlots[0].id,
          name: 'Cotton',
          variety: 'Bt-II RCH-659',
          sowing_date: '2026-06-15',
          base_temperature_c: 15.6,
          target_gdd: 1800.0
        });
        setCrops([newCrop]);
        setSelectedCrop(newCrop);
        const gdd = await api.calculateGDD(newCrop.id);
        setGddData(gdd);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecalculateGDD = async () => {
    if (!selectedCrop) return;
    setRefreshing(true);
    try {
      const updated = await api.calculateGDD(selectedCrop.id);
      setGddData(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const totalAcres = plots.reduce((sum, p) => sum + (p.area_acres || 0), 0);

  return (
    <div className="page-content">
      {/* Top Welcome & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {t('dash_title', 'Agro Operating Command Center')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            {t('dash_desc', 'Real-time crop thermal accumulation, drone health scans, and double-entry farm financial summary.')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadData} disabled={refreshing} className="btn-secondary">
            <RefreshCw size={16} className={refreshing ? 'animate-radar' : ''} />
            <span>{t('sync_live', 'Sync Live Data')}</span>
          </button>
          <button onClick={() => onNavigateTab('drone')} className="btn-primary">
            <Plane size={16} />
            <span>{t('launch_drone', 'Launch Drone Studio')}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid-4">
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('stat_crop', 'Cultivated Crop')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
              <Sprout size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
            {selectedCrop ? selectedCrop.name : 'No Active Crop'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', marginTop: '4px' }}>
            {selectedCrop?.variety || 'Certified'} • {crops.length} Active Cycle{crops.length > 1 ? 's' : ''}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('stat_acres', 'Total Farm Acreage')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--wheat-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--wheat-gold)' }}>
              <MapPin size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }} className="font-mono">
            {totalAcres.toFixed(1)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Acres</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {plots.length} Registered Plots
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('stat_gdd', 'Cumulative Thermal GDD')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--azure-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--azure-info)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }} className="font-mono">
            {gddData ? Math.round(gddData.current_gdd) : 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>°C-days</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--azure-info)', marginTop: '4px' }}>
            {gddData?.current_stage || 'Calculating...'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('stat_profit', 'Ledger Net Profit')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }} className="font-mono">
            ₹{khataSummary ? khataSummary.net_profit.toLocaleString('en-IN') : '0'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', marginTop: '4px' }}>
            {khataSummary?.transaction_count || 0} Recorded Entries
          </div>
        </div>
      </div>

      {/* Main Row: GDD Stage Engine & Weather Spray Advisory */}
      <div className="grid-2">
        {/* GDD Thermal Tracker */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('growth_meter', 'Physiological Growth Meter (GDD)')}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {t('growth_sub', 'Open-Meteo temperature integration from sowing date')} ({selectedCrop?.sowing_date || '2026-06-15'})
              </p>
            </div>
            <button
              onClick={handleRecalculateGDD}
              disabled={refreshing}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={13} className={refreshing ? 'animate-radar' : ''} />
              <span>{t('update_gdd', 'Update GDD')}</span>
            </button>
          </div>

          <GDDGauge
            currentGDD={gddData?.current_gdd || 450}
            targetGDD={gddData?.target_gdd || 1800}
            stageName={gddData?.current_stage || 'Squaring Phase'}
          />

          {/* Growth Stage Milestones */}
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Emergence (120)</span>
              <span>Squaring (600)</span>
              <span>Flowering (1200)</span>
              <span>Maturity (1800)</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${gddData?.progress_percentage || 25}%`,
                  background: 'linear-gradient(90deg, var(--palette-3), var(--palette-1))',
                  borderRadius: '4px',
                  transition: 'width 0.8s ease-in-out'
                }}
              />
            </div>
          </div>
        </div>

        {/* Real-time Agricultural Weather & Spray Radar */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('weather_title', 'Agricultural Weather & Spray Conditions')}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {t('weather_sub', 'Hyper-local agrochemical drift and wash-off risk assessment')}
              </p>
            </div>
            <span className="badge badge-info">Open-Meteo live</span>
          </div>

          {weather ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'space-between' }}>
              {/* Current Ambient Conditions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--glass-border)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Temperature</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }} className="font-mono">
                    {weather.current_temperature}°C
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wind Velocity</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }} className="font-mono">
                    {weather.current_wind_speed} <span style={{ fontSize: '0.75rem' }}>km/h</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Humidity</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }} className="font-mono">
                    {weather.current_humidity}%
                  </div>
                </div>
              </div>

              {/* Advisory Box */}
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                background: weather.spray_status === 'OPTIMAL' ? 'var(--brand-dim)' : 'var(--wheat-dim)',
                border: weather.spray_status === 'OPTIMAL' ? '1px solid var(--glass-border-hover)' : '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: weather.spray_status === 'OPTIMAL' ? 'var(--brand-primary)' : '#fde68a' }}>
                  <Wind size={18} />
                  <span>Spray Recommendation: {weather.spray_status}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '6px', lineHeight: 1.4 }}>
                  {weather.spray_rationale}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => onNavigateTab('market')}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <span>{t('view_7day', 'View 7-Day Forecast & APMC Mandi Rates')}</span>
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>
              Loading meteorological forecast...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

