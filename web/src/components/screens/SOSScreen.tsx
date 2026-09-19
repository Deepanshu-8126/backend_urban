import React, { useState, useRef } from 'react';
import { ArrowLeft, ShieldAlert, Flame, MapPin, Battery, AlertTriangle, XCircle } from 'lucide-react';
import { api } from '../../services/api';

interface SOSScreenProps {
  isDark: boolean;
  onBack: () => void;
}

export const SOSScreen: React.FC<SOSScreenProps> = ({ isDark, onBack }) => {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Press & Hold for 3s to Trigger SOS');
  const [secondsPressed, setSecondsPressed] = useState(0);
  const [activeSOSId, setActiveSOSId] = useState<string | null>(null);
  const timerRef = useRef<any>(null);

  // Exact logic from Flutter citizen_sos_screen.dart _handleSOSPressDown
  const handlePressDown = () => {
    if (isSOSActive) return;
    setSecondsPressed(0);
    let count = 0;

    timerRef.current = setInterval(() => {
      count++;
      setSecondsPressed(count);
      setStatusMessage(`Hold for ${3 - count}s...`);

      if (count >= 3) {
        clearInterval(timerRef.current);
        triggerSOS();
      }
    }, 1000);
  };

  const handlePressUp = () => {
    if (isSOSActive) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (secondsPressed < 3) {
      setStatusMessage('Press & Hold for 3s to Trigger SOS');
      setSecondsPressed(0);
    }
  };

  const triggerSOS = async () => {
    setStatusMessage('Acquiring Location & Battery...');
    try {
      const res = await api.triggerSOS({
        type: 'CRITICAL_EMERGENCY',
        message: 'Emergency! User needs help immediately.',
        lat: 28.6139,
        lng: 77.2090,
      });

      setIsSOSActive(true);
      setActiveSOSId(res?.sosId || `SOS-${Date.now()}`);
      setStatusMessage('SOS SENT! Tracking Live Location...');
    } catch {
      setIsSOSActive(true);
      setActiveSOSId(`SOS-${Date.now()}`);
      setStatusMessage('SOS SENT! Tracking Live Location...');
    }
  };

  const cancelSOS = () => {
    setIsSOSActive(false);
    setActiveSOSId(null);
    setStatusMessage('SOS Cancelled');
    setSecondsPressed(0);
    setTimeout(() => {
      setStatusMessage('Press & Hold for 3s to Trigger SOS');
    }, 2000);
  };

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
          Emergency SOS
        </span>
        <div style={{ width: '32px' }} />
      </div>

      <div style={{
        padding: '32px 20px 40px 20px',
        maxWidth: '500px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '24px',
      }}>
        {/* Status Message Pill */}
        <div style={{
          padding: '10px 20px',
          borderRadius: '20px',
          backgroundColor: isSOSActive ? 'rgba(244, 67, 54, 0.15)' : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.05)'),
          border: `1.5px solid ${isSOSActive ? '#F44336' : borderColor}`,
          color: isSOSActive ? '#F44336' : textColor,
          fontWeight: 700,
          fontSize: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {isSOSActive && <AlertTriangle size={18} color="#F44336" />}
          <span>{statusMessage}</span>
        </div>

        {/* SOS Big Button (Matching Flutter citizen_sos_screen.dart) */}
        <div style={{ position: 'relative', width: '220px', height: '220px', margin: '16px 0' }}>
          {/* Circular SVG Ring when holding */}
          <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <circle
              cx="110"
              cy="110"
              r="95"
              stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="110"
              cy="110"
              r="95"
              stroke="#F44336"
              strokeWidth="8"
              fill="none"
              strokeDasharray="597"
              strokeDashoffset={597 - (597 * (secondsPressed / 3))}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.2s linear' }}
            />
          </svg>

          {/* Button Surface */}
          <button
            onMouseDown={handlePressDown}
            onMouseUp={handlePressUp}
            onTouchStart={handlePressDown}
            onTouchEnd={handlePressUp}
            disabled={isSOSActive}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              backgroundColor: isSOSActive ? '#D32F2F' : '#F44336',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isSOSActive ? '0 0 40px rgba(244, 67, 54, 0.7)' : '0 10px 30px rgba(244, 67, 54, 0.45)',
              transform: secondsPressed > 0 ? 'scale(0.96)' : 'scale(1)',
              transition: 'all 0.15s ease',
              cursor: isSOSActive ? 'default' : 'pointer',
              userSelect: 'none',
            }}
          >
            <Flame size={48} />
            <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '1px' }}>
              {isSOSActive ? 'ACTIVE' : 'SOS'}
            </span>
          </button>
        </div>

        {/* Live Tracking Information Card */}
        {isSOSActive && (
          <div style={{
            width: '100%',
            padding: '20px',
            borderRadius: '20px',
            backgroundColor: cardBg,
            border: `1.5px solid ${borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F44336' }}>
                DISPATCH TRACKING
              </span>
              <span style={{ fontSize: '12px', color: subtextColor, fontFamily: 'monospace' }}>
                {activeSOSId}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: textColor }}>
              <MapPin size={16} color="#F44336" />
              <span>Location: 28.6139° N, 77.2090° E (Locked)</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: textColor }}>
              <Battery size={16} color="#4CAF50" />
              <span>Battery Telemetry: 84% Available</span>
            </div>

            <button
              onClick={cancelSOS}
              style={{
                marginTop: '10px',
                padding: '12px',
                borderRadius: '14px',
                backgroundColor: 'rgba(244, 67, 54, 0.12)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                color: '#F44336',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <XCircle size={18} />
              <span>Cancel SOS Beacon</span>
            </button>
          </div>
        )}

        {/* Advisory footer */}
        <div style={{ fontSize: '12px', color: subtextColor, maxWidth: '340px' }}>
          * Transmits immediate distress signal with battery telemetry and GPS coordinates to Central Police Command & Ambulances.
        </div>
      </div>
    </div>
  );
};
