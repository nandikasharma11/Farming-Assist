import React from 'react';

interface GDDGaugeProps {
  currentGDD: number;
  targetGDD: number;
  stageName: string;
  size?: number;
}

export const GDDGauge: React.FC<GDDGaugeProps> = ({
  currentGDD,
  targetGDD,
  stageName,
  size = 190,
}) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(1.0, Math.max(0.0, currentGDD / (targetGDD || 1800)));
  const strokeDashoffset = circumference - progressRatio * circumference;
  const percentage = Math.round(progressRatio * 100);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="gddGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="70%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth="12"
          fill="none"
        />

        {/* Animated Progress Stroke */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="url(#gddGradient)"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>

      {/* Center Metrics Content */}
      <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.1 }} className="font-mono">
          {Math.round(currentGDD)}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          / {Math.round(targetGDD)} GDD ({percentage}%)
        </div>
        <div style={{
          marginTop: '6px',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--emerald-primary)',
          background: 'rgba(16, 185, 129, 0.12)',
          padding: '2px 8px',
          borderRadius: '999px',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          maxWidth: '120px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {stageName}
        </div>
      </div>
    </div>
  );
};
