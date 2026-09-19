import React, { useState, useEffect } from 'react';
import { Wind, Activity, AlertCircle, Droplets, Gauge, ShieldCheck, Thermometer } from 'lucide-react';
import { api, AQIData } from '../services/api';

export const AQIMonitor: React.FC = () => {
  const [aqiData, setAqiData] = useState<AQIData | null>(null);

  useEffect(() => {
    const fetchAQI = async () => {
      const data = await api.getAQI();
      setAqiData(data);
    };
    fetchAQI();
  }, []);

  const aqiValue = aqiData?.aqi || 118;
  const isGood = aqiValue <= 50;
  const isModerate = aqiValue > 50 && aqiValue <= 120;
  const isUnhealthy = aqiValue > 120;

  const aqiColor = isGood ? 'var(--neon-emerald)' : isModerate ? 'var(--neon-amber)' : 'var(--neon-rose)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wind size={24} color="var(--neon-cyan)" />
          Environmental Telemetry & Metro AQI
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Real-time sensor arrays broadcasting atmospheric particulate matter and pollutant concentrations
        </p>
      </div>

      {/* Main AQI Gauge Card */}
      <div className="hud-panel" style={{
        padding: '36px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '32px',
        alignItems: 'center',
      }}>
        {/* Left Circular Gauge Display */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            position: 'relative',
            width: '200px',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* SVG Ring */}
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle
                cx="100"
                cy="100"
                r="84"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r="84"
                stroke={aqiColor}
                strokeWidth="12"
                fill="none"
                strokeDasharray="527"
                strokeDashoffset={527 - (527 * Math.min(aqiValue, 300)) / 300}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>

            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <span style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: aqiColor, display: 'block', lineHeight: 1 }}>
                {aqiValue}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                US AQI
              </span>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <span className={`badge ${isGood ? 'badge-emerald' : isModerate ? 'badge-amber' : 'badge-rose'}`} style={{ fontSize: '13px' }}>
              {aqiData?.status || 'Moderate Air Quality'}
            </span>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Monitoring Station: {aqiData?.station || 'Sector 4 Grid'}
            </div>
          </div>
        </div>

        {/* Right Advisory & Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
          }}>
            <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="var(--neon-cyan)" /> Health Advisory
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {aqiData?.advisory || 'Air quality is acceptable for the general public. Sensitive individuals should consider reducing intense outdoor endurance.'}
            </p>
          </div>

          {/* Environmental factors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Thermometer size={13} /> Ambient Temp
              </span>
              <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>27.4° C</span>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Droplets size={13} /> Relative Humidity
              </span>
              <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>54% RH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chemical Pollutant Breakdown Grid */}
      <div>
        <h3 style={{ fontSize: '18px', marginBottom: '14px' }}>Atmospheric Pollutant Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { name: 'PM 2.5', value: aqiData?.pm25 || 42.4, unit: 'µg/m³', status: 'Moderate', desc: 'Fine respirable particles' },
            { name: 'PM 10', value: aqiData?.pm10 || 88.1, unit: 'µg/m³', status: 'Moderate', desc: 'Coarse dust and pollen' },
            { name: 'NO₂', value: aqiData?.no2 || 24.6, unit: 'ppb', status: 'Good', desc: 'Nitrogen Dioxide emission' },
            { name: 'O₃', value: aqiData?.o3 || 18.2, unit: 'ppb', status: 'Good', desc: 'Tropospheric surface ozone' },
          ].map((pollutant) => (
            <div key={pollutant.name} className="hud-panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px' }}>{pollutant.name}</span>
                <span className="badge badge-cyan" style={{ fontSize: '10px' }}>{pollutant.status}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {pollutant.value} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pollutant.unit}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{pollutant.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
