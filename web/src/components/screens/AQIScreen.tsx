import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wind, ShieldCheck, Thermometer, Droplets, RefreshCw } from 'lucide-react';
import { api, AQIData } from '../../services/api';

interface AQIScreenProps {
  isDark: boolean;
  onBack: () => void;
}

export const AQIScreen: React.FC<AQIScreenProps> = ({ isDark, onBack }) => {
  const [data, setData] = useState<AQIData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAQI = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAQI();
      setData(res);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAQI();
  }, []);

  const aqiVal = data?.aqi || 118;
  const aqiColor = aqiVal <= 50 ? '#4CAF50' : aqiVal <= 120 ? '#FFAB40' : '#F44336';
  const textColor = isDark ? '#FFFFFF' : '#1E293B';
  const subtextColor = isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748B';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Flutter AppBar */}
      <div className={`flutter-app-bar ${isDark ? 'flutter-app-bar-dark' : 'flutter-app-bar-light'}`}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: textColor,
            padding: '6px',
            borderRadius: '50%',
          }}
        >
          <ArrowLeft size={22} />
        </button>
        <span style={{ fontWeight: 'bold', fontSize: '18px', color: textColor }}>
          AQI Monitor
        </span>
        <button
          onClick={fetchAQI}
          style={{ color: textColor, padding: '6px', borderRadius: '50%' }}
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div style={{ padding: '24px 16px 40px 16px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
        {/* Main AQI Meter Card (Matching Flutter aqi_monitor_screen.dart) */}
        <div style={{
          backgroundColor: cardBg,
          border: `1.5px solid ${borderColor}`,
          borderRadius: '24px',
          padding: '32px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
          boxShadow: `0 10px 30px -10px ${aqiColor}20`,
        }}>
          {/* Circular Ring Gauge */}
          <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle
                cx="90"
                cy="90"
                r="76"
                stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.06)'}
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="90"
                cy="90"
                r="76"
                stroke={aqiColor}
                strokeWidth="12"
                fill="none"
                strokeDasharray="477"
                strokeDashoffset={477 - (477 * Math.min(aqiVal, 300)) / 300}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>

            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '46px', fontWeight: 800, color: aqiColor, lineHeight: 1 }}>
                {aqiVal}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: subtextColor, textTransform: 'uppercase', marginTop: '4px' }}>
                AQI INDEX
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '16px',
            padding: '6px 16px',
            borderRadius: '12px',
            backgroundColor: `${aqiColor}1A`,
            color: aqiColor,
            fontWeight: 700,
            fontSize: '14px',
          }}>
            {data?.status || 'Moderate Air Quality'}
          </div>

          <div style={{ fontSize: '12px', color: subtextColor, marginTop: '8px' }}>
            Station: {data?.station || 'Sector 4 Grid Array'}
          </div>
        </div>

        {/* Health Advisory */}
        <div style={{
          backgroundColor: cardBg,
          border: `1.5px solid ${borderColor}`,
          borderRadius: '20px',
          padding: '18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            backgroundColor: 'rgba(100, 255, 218, 0.15)',
            color: '#64FFDA',
          }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: textColor, marginBottom: '4px' }}>
              Public Health Advisory
            </div>
            <div style={{ fontSize: '13px', color: subtextColor, lineHeight: 1.4 }}>
              {data?.advisory || 'Air quality is acceptable. Sensitive groups should avoid strenuous outdoor exertion.'}
            </div>
          </div>
        </div>

        {/* Particulate Matter Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{
            backgroundColor: cardBg,
            border: `1.5px solid ${borderColor}`,
            borderRadius: '18px',
            padding: '16px',
          }}>
            <div style={{ fontSize: '12px', color: subtextColor, fontWeight: 600 }}>PM 2.5 Particulate</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: textColor, margin: '4px 0' }}>
              {data?.pm25 || 42.4} <span style={{ fontSize: '11px', color: subtextColor }}>µg/m³</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64FFDA', fontWeight: 600 }}>Fine inhalable dust</div>
          </div>

          <div style={{
            backgroundColor: cardBg,
            border: `1.5px solid ${borderColor}`,
            borderRadius: '18px',
            padding: '16px',
          }}>
            <div style={{ fontSize: '12px', color: subtextColor, fontWeight: 600 }}>PM 10 Particulate</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: textColor, margin: '4px 0' }}>
              {data?.pm10 || 88.1} <span style={{ fontSize: '11px', color: subtextColor }}>µg/m³</span>
            </div>
            <div style={{ fontSize: '11px', color: '#FFAB40', fontWeight: 600 }}>Coarse dust particles</div>
          </div>

          <div style={{
            backgroundColor: cardBg,
            border: `1.5px solid ${borderColor}`,
            borderRadius: '18px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Thermometer size={22} color="#448AFF" />
            <div>
              <div style={{ fontSize: '11px', color: subtextColor }}>Temperature</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: textColor }}>27.4° C</div>
            </div>
          </div>

          <div style={{
            backgroundColor: cardBg,
            border: `1.5px solid ${borderColor}`,
            borderRadius: '18px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Droplets size={22} color="#64FFDA" />
            <div>
              <div style={{ fontSize: '11px', color: subtextColor }}>Humidity</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: textColor }}>54% RH</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
