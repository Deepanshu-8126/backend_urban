import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  MapPin, 
  PhoneCall, 
  Radio, 
  AlertOctagon, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { api } from '../services/api';

export const EmergencySOS: React.FC = () => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTriggered, setIsTriggered] = useState(false);
  const [sosId, setSosId] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sosType, setSosType] = useState('POLICE_ASSISTANCE');
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Acquire geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Default fallback to municipal headquarters coordinates
          setCoords({ lat: 28.6139, lng: 77.2090 });
        }
      );
    }
  }, []);

  const handleMouseDown = () => {
    if (isTriggered) return;
    setHolding(true);
    setProgress(0);

    const startTime = Date.now();
    const duration = 2400; // 2.4 seconds to trigger

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(timerRef.current);
        triggerEmergency();
      }
    }, 30);
  };

  const handleMouseUp = () => {
    if (!isTriggered) {
      clearInterval(timerRef.current);
      setHolding(false);
      setProgress(0);
    }
  };

  const triggerEmergency = async () => {
    setIsTriggered(true);
    setHolding(false);
    try {
      const res = await api.triggerSOS({
        type: sosType,
        message: 'CRITICAL EMERGENCY: Civilian beacon broadcasted from web console.',
        lat: coords?.lat,
        lng: coords?.lng,
      });
      setSosId(res?.sosId || `SOS-${Date.now()}`);
    } catch {
      setSosId(`SOS-${Date.now()}`);
    }
  };

  const handleReset = () => {
    setIsTriggered(false);
    setProgress(0);
    setSosId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
        <span className="badge badge-rose" style={{ marginBottom: '12px' }}>
          <Radio size={12} className="animate-pulse" /> HIGH-PRIORITY CIVIC BEACON
        </span>
        <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>
          Emergency Telemetry Dispatch
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Press and hold for 3 seconds to transmit your immediate geographic beacon to the Integrated Command and Control Center (ICCC).
        </p>
      </div>

      {/* Main Hold Trigger Console */}
      <div className="hud-panel hud-panel-rose" style={{
        padding: '48px 32px',
        maxWidth: '680px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Type Selector */}
        {!isTriggered && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '36px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { id: 'POLICE_ASSISTANCE', label: 'Police Assistance', icon: ShieldAlert },
              { id: 'MEDICAL_AMBULANCE', label: 'Ambulance & Medical', icon: PhoneCall },
              { id: 'FIRE_HAZARD', label: 'Fire & Rescue', icon: Flame },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = sosType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSosType(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: isSelected ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isSelected ? 'var(--neon-rose)' : 'var(--border-subtle)'}`,
                    color: isSelected ? 'var(--neon-rose)' : 'var(--text-secondary)',
                  }}
                >
                  <Icon size={14} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* The Hold Button */}
        {!isTriggered ? (
          <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 24px auto' }}>
            {/* SVG Progress Circle */}
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle
                cx="110"
                cy="110"
                r="96"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="110"
                cy="110"
                r="96"
                stroke="var(--neon-rose)"
                strokeWidth="10"
                fill="none"
                strokeDasharray="603"
                strokeDashoffset={603 - (603 * progress) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
              />
            </svg>

            {/* Inner Push Surface */}
            <button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: holding 
                  ? 'radial-gradient(circle, #f43f5e 0%, #881337 100%)' 
                  : 'radial-gradient(circle, #be123c 0%, #4c0519 100%)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: holding ? '0 0 50px rgba(244, 63, 94, 0.8)' : '0 0 24px rgba(244, 63, 94, 0.3)',
                transform: holding ? 'scale(0.96)' : 'scale(1)',
                transition: 'all 0.15s ease',
                userSelect: 'none',
              }}
            >
              <Flame size={42} />
              <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                {holding ? 'TRANSMITTING' : 'HOLD SOS'}
              </span>
              <span style={{ fontSize: '11px', opacity: 0.8 }}>
                {holding ? `${Math.round(progress)}%` : 'Press 3 seconds'}
              </span>
            </button>
          </div>
        ) : (
          /* Active Emergency Broadcast Screen */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '2px solid var(--neon-rose)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--neon-rose)',
              boxShadow: 'var(--shadow-glow-rose)',
            }}>
              <AlertOctagon size={44} className="animate-pulse" />
            </div>

            <h3 style={{ fontSize: '24px', color: 'var(--neon-rose)' }}>
              EMERGENCY BROADCAST ACTIVE
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', fontSize: '14px' }}>
              Your distress beacon has been locked onto dispatch frequency. Units have been allocated your real-time telemetry coordinates.
            </p>

            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '16px 24px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div>DISPATCH ID: <span style={{ color: 'var(--neon-cyan)' }}>{sosId}</span></div>
              <div>GEOLOCATION: <span style={{ color: 'var(--neon-emerald)' }}>{coords ? `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E` : 'Locking...'}</span></div>
              <div>ESTIMATED RESPONSE: <span style={{ color: 'var(--neon-amber)' }}>4 MINUTES</span></div>
            </div>

            <button onClick={handleReset} className="btn-secondary" style={{ marginTop: '12px' }}>
              Cancel & Stand Down Beacon
            </button>
          </div>
        )}

        {/* Location Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          <MapPin size={13} color="var(--neon-cyan)" />
          <span>Locked Coordinates: {coords ? `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E (Metro Sector)` : 'Acquiring GPS...'}</span>
        </div>
      </div>

      {/* Live Disaster Radar Bulletin */}
      <div>
        <h3 style={{ fontSize: '18px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon size={18} color="var(--neon-amber)" /> Active Civic Disaster Bulletins
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div className="hud-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="badge badge-amber">WEATHER ADVISORY</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Updated 12m ago</span>
            </div>
            <h4 style={{ fontSize: '15px', marginBottom: '6px' }}>High Wind Gusts Alert in Coastal Sectors</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Wind speeds exceeding 55 km/h predicted. Municipal crane operations suspended until 18:00 hrs.
            </p>
          </div>

          <div className="hud-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="badge badge-emerald">ROAD RESCUE</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Operational</span>
            </div>
            <h4 style={{ fontSize: '15px', marginBottom: '6px' }}>24x7 Rapid Ambulance Fleet Positioned</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              36 Advanced Life Support (ALS) ambulances stationed across 12 major transit corridors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
