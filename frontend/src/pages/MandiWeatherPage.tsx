import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { MandiRate, WeatherAdvisory } from '../services/types';
import {
  CloudSun,
  Search
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const MandiWeatherPage: React.FC = () => {
  const { t } = useLanguage();
  const [rates, setRates] = useState<MandiRate[]>([]);
  const [weather, setWeather] = useState<WeatherAdvisory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedState]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mandiRes, weatherRes] = await Promise.all([
        api.getMandiPrices(searchTerm || undefined, selectedState || undefined),
        api.getWeatherAdvisory(),
      ]);
      setRates(mandiRes.rates);
      setWeather(weatherRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {t('mandi_title', 'Mandi Market Intelligence & Spray Weather Hub')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          {t('mandi_desc', 'Live APMC commodity price discovery, MSP comparisons, and 7-day agricultural weather forecast.')}
        </p>
      </div>

      {/* 7-Day Agricultural Spray Advisory Forecast */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CloudSun size={22} style={{ color: 'var(--wheat-gold)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('spray_7day', '7-Day Agricultural Spray Feasibility Forecast')}
            </h3>
          </div>
          <span className="badge badge-info">Open-Meteo Integration</span>
        </div>

        {weather && weather.forecast ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px'
          }}>
            {weather.forecast.map((day) => {
              const isOptimal = day.spray_status === 'OPTIMAL';
              const isWind = day.spray_status === 'CAUTION_WIND';
              const isRain = day.spray_status === 'NO_SPRAY';

              return (
                <div
                  key={day.date}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {day.t_max}° <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {day.t_min}°C</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {day.condition}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    <span>Rain: {day.precipitation_probability}%</span>
                    <span>Wind: {day.wind_speed_max} km/h</span>
                  </div>

                  {/* Spray Status Badge */}
                  <div style={{ marginTop: 'auto', paddingTop: '6px' }}>
                    <span className={`badge ${isOptimal ? 'badge-success' : isWind ? 'badge-warning' : isRain ? 'badge-critical' : 'badge-warning'}`} style={{ width: '100%', justifyContent: 'center' }}>
                      {isOptimal ? t('spray_optimal', 'Optimal') : isWind ? t('spray_wind', 'Wind Drift') : isRain ? t('spray_rain', 'Wash-off Risk') : t('spray_evening', 'Evening Only')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
            Loading weather forecast...
          </div>
        )}
      </div>

      {/* APMC Mandi Rates Table & Search */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('mandi_benchmarks', 'Live APMC Mandi Price Benchmarks')}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Real-time daily modal prices, trade volumes, and MSP benchmarks
            </p>
          </div>

          {/* Search & Filter Inputs */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={t('search_placeholder', 'Search Cotton, Wheat...')}
                className="glass-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '220px', paddingLeft: '32px' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="glass-input"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="" style={{ background: 'var(--palette-5)', color: '#fff' }}>All States</option>
              <option value="Maharashtra" style={{ background: 'var(--palette-5)', color: '#fff' }}>Maharashtra</option>
              <option value="Madhya Pradesh" style={{ background: 'var(--palette-5)', color: '#fff' }}>Madhya Pradesh</option>
              <option value="Punjab" style={{ background: 'var(--palette-5)', color: '#fff' }}>Punjab</option>
              <option value="Rajasthan" style={{ background: 'var(--palette-5)', color: '#fff' }}>Rajasthan</option>
            </select>
          </div>
        </div>

        {/* Mandi Table */}
        <div className="table-container">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Commodity</th>
                <th>Variety</th>
                <th>APMC Market</th>
                <th>District / State</th>
                <th>Min - Max (₹)</th>
                <th>Modal Price (₹/Qtl)</th>
                <th>Price Trend</th>
                <th>Arrivals (Tons)</th>
              </tr>
            </thead>
            <tbody>
              {rates.length > 0 ? (
                rates.map((rate, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rate.commodity}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{rate.variety}</td>
                    <td style={{ fontWeight: 500 }}>{rate.market}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{rate.district}, {rate.state}</td>
                    <td className="font-mono">₹{rate.min_price} - ₹{rate.max_price}</td>
                    <td className="font-mono" style={{ fontWeight: 800, color: '#fde68a', fontSize: '1rem' }}>
                      ₹{rate.modal_price}
                    </td>
                    <td>
                      <span style={{
                        color: rate.trend_pct >= 0 ? '#86efac' : '#fca5a5',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}>
                        {rate.trend_pct >= 0 ? `+${rate.trend_pct}%` : `${rate.trend_pct}%`}
                      </span>
                    </td>
                    <td className="font-mono">{rate.arrival_tons} T</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    {loading ? 'Retrieving live APMC Mandi commodity rates...' : 'No mandi rates found matching your search criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

