import React from 'react';

interface DroneScanRadarProps {
  isScanning?: boolean;
  severity?: 'LOW' | 'MEDIUM' | 'CRITICAL';
  quadrantLabel?: string;
  size?: number;
}

export const DroneScanRadar: React.FC<DroneScanRadarProps> = ({
  isScanning = true,
  severity = 'MEDIUM',
  quadrantLabel = 'North-East Sector',
  size = 280,
}) => {
  const blipColor = severity === 'CRITICAL' ? '#ef4444' : severity === 'MEDIUM' ? '#f59e0b' : '#10b981';

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ overflow: 'visible' }}>
        <defs>
          {/* Sweeping Radar Beam Gradient */}
          <linearGradient id="radarSweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>

          {/* Luminous Glow Filter */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Grid Circle */}
        <circle cx="100" cy="100" r="95" fill="rgba(8, 14, 10, 0.75)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(16, 185, 129, 0.18)" strokeDasharray="3,3" />
        <circle cx="100" cy="100" r="45" fill="none" stroke="rgba(16, 185, 129, 0.18)" />
        <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(16, 185, 129, 0.25)" />

        {/* Crosshair Axes */}
        <line x1="100" y1="5" x2="100" y2="195" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
        <line x1="5" y1="100" x2="195" y2="100" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />

        {/* Cardinal Direction Markers */}
        <text x="100" y="16" fill="rgba(16, 185, 129, 0.7)" fontSize="8" fontWeight="700" textAnchor="middle">N</text>
        <text x="188" y="103" fill="rgba(16, 185, 129, 0.7)" fontSize="8" fontWeight="700" textAnchor="middle">E</text>
        <text x="100" y="192" fill="rgba(16, 185, 129, 0.7)" fontSize="8" fontWeight="700" textAnchor="middle">S</text>
        <text x="14" y="103" fill="rgba(16, 185, 129, 0.7)" fontSize="8" fontWeight="700" textAnchor="middle">W</text>

        {/* Rotating Radar Sweep Cone */}
        {isScanning && (
          <g className="animate-radar">
            <path
              d="M 100 100 L 195 100 A 95 95 0 0 1 167 167 Z"
              fill="url(#radarSweepGradient)"
            />
            <line x1="100" y1="100" x2="195" y2="100" stroke="#34d399" strokeWidth="2" filter="url(#neonGlow)" />
          </g>
        )}

        {/* Disease Detection Target Crosshair / Blip */}
        <g transform="translate(135, 65)">
          <circle cx="0" cy="0" r="7" fill="none" stroke={blipColor} strokeWidth="1.5" className="animate-pulse-glow" />
          <circle cx="0" cy="0" r="3" fill={blipColor} filter="url(#neonGlow)" />
          <line x1="-10" y1="0" x2="10" y2="0" stroke={blipColor} strokeWidth="1" />
          <line x1="0" y1="-10" x2="0" y2="10" stroke={blipColor} strokeWidth="1" />
        </g>

        {/* Center Point */}
        <circle cx="100" cy="100" r="3.5" fill="#10b981" filter="url(#neonGlow)" />
      </svg>

      {/* Telemetry Tag Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(6, 10, 8, 0.85)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: 'var(--radius-full)',
        padding: '3px 12px',
        fontSize: '0.72rem',
        color: 'var(--emerald-primary)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }}>
        SCANNER: {quadrantLabel}
      </div>
    </div>
  );
};
