import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Wind, 
  Zap, 
  ArrowUpRight, 
  AlertTriangle,
  Building,
  TrendingUp,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { api, CityStats } from '../services/api';

interface CityOverviewProps {
  onNavigate: (tab: string) => void;
}

export const CityOverview: React.FC<CityOverviewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<CityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCityStats();
      setStats(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Headline & Telemetry Ticker */}
      <div className="hud-panel hud-panel-cyan" style={{ padding: '32px 36px', position: 'relative' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className="badge badge-cyan">
                <Activity size={13} /> REAL-TIME CIVIC TELEMETRY
              </span>
              <span className="badge badge-emerald">
                <span className="beacon-dot emerald" /> 50+ REST ENDPOINTS ACTIVE
              </span>
            </div>
            <h1 style={{ fontSize: '36px', lineHeight: 1.15, marginBottom: '12px', maxWidth: '780px' }}>
              Next-Gen Urban Operating System & Civic Intelligence
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '720px' }}>
              Unified command infrastructure synchronizing automated grievance triage, instant emergency beacon broadcast, environmental sensors, and property assessments across all municipal wards.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={fetchStats}
              className="btn-secondary"
              style={{ padding: '10px 14px', gap: '6px' }}
              title="Refresh telemetry feed"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh HUD</span>
            </button>
            <button 
              onClick={() => onNavigate('complaints')}
              className="btn-primary"
            >
              <span>File Civic Grievance</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Live Broadcast Ticker */}
        <div style={{
          marginTop: '28px',
          padding: '12px 18px',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px',
        }}>
          <span style={{ 
            color: 'var(--neon-amber)', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            whiteSpace: 'nowrap'
          }}>
            <AlertTriangle size={15} /> MUNICIPAL NOTICE:
          </span>
          <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Scheduled power grid maintenance in Ward 8 between 02:00 - 04:00 hrs. AI Grievance auto-routing active with 94.2% accuracy.
          </div>
        </div>
      </div>

      {/* KPI Telemetry Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '18px',
      }}>
        {/* KPI 1: Active Grievances */}
        <div 
          onClick={() => onNavigate('complaints')}
          className="hud-panel hud-panel-cyan" 
          style={{ padding: '24px', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Grievances
            </span>
            <div style={{ 
              padding: '8px', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(0, 240, 255, 0.1)', 
              color: 'var(--neon-cyan)' 
            }}>
              <Building size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {stats?.openComplaints ?? '...'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: 'var(--neon-cyan)' }}>
            <TrendingUp size={14} />
            <span>Avg resolution SLA: 4.2 hrs</span>
          </div>
        </div>

        {/* KPI 2: Resolved Cases */}
        <div className="hud-panel hud-panel-emerald" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
              Resolved Issues
            </span>
            <div style={{ 
              padding: '8px', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: 'var(--neon-emerald)' 
            }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--neon-emerald)' }}>
            {stats?.resolvedComplaints ?? '...'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>98.6% Citizen satisfaction score</span>
          </div>
        </div>

        {/* KPI 3: Live SOS Beacons */}
        <div 
          onClick={() => onNavigate('sos')}
          className="hud-panel hud-panel-rose" 
          style={{ padding: '24px', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
              Emergency Beacons
            </span>
            <div style={{ 
              padding: '8px', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(244, 63, 94, 0.12)', 
              color: 'var(--neon-rose)' 
            }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--neon-rose)' }}>
            {stats?.activeSOS ?? 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: 'var(--neon-rose)' }}>
            <span className="beacon-dot rose" />
            <span>PCR Units En Route</span>
          </div>
        </div>

        {/* KPI 4: Air Quality Index */}
        <div 
          onClick={() => onNavigate('aqi')}
          className="hud-panel" 
          style={{ padding: '24px', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
              Metro AQI Index
            </span>
            <div style={{ 
              padding: '8px', 
              borderRadius: 'var(--radius-md)', 
              background: 'rgba(245, 158, 11, 0.1)', 
              color: 'var(--neon-amber)' 
            }}>
              <Wind size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--neon-amber)' }}>
            {stats?.averageAQI ?? '...'} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>AQI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Moderate • Dominant: PM 2.5</span>
          </div>
        </div>
      </div>

      {/* Feature Navigation Modules */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Municipal Service Portals</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {/* Card 1: AI Grievance Hub */}
          <div 
            onClick={() => onNavigate('complaints')}
            className="hud-panel hud-panel-cyan"
            style={{ padding: '24px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', background: 'rgba(0, 240, 255, 0.1)', borderRadius: 'var(--radius-md)' }}>
                <Building size={22} color="var(--neon-cyan)" />
              </div>
              <div>
                <h3 style={{ fontSize: '17px' }}>Grievance Engine</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Automated department dispatch</span>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Report civic infrastructure anomalies (potholes, streetlights, sanitation) with geotagging and instant ticket generation.
            </p>
            <span style={{ color: 'var(--neon-cyan)', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Launch Grievance Portal <ArrowUpRight size={14} />
            </span>
          </div>

          {/* Card 2: CityBrain AI */}
          <div 
            onClick={() => onNavigate('citybrain')}
            className="hud-panel"
            style={{ padding: '24px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.12)', borderRadius: 'var(--radius-md)' }}>
                <Cpu size={22} color="var(--neon-violet)" />
              </div>
              <div>
                <h3 style={{ fontSize: '17px' }}>CityBrain AI Assistant</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Groq / Gemini civic assistant</span>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Conversational assistant answers municipal regulations, water schedules, building permits, and tracks active complaint status.
            </p>
            <span style={{ color: 'var(--neon-violet)', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Chat with CityBrain <ArrowUpRight size={14} />
            </span>
          </div>

          {/* Card 3: Emergency SOS */}
          <div 
            onClick={() => onNavigate('sos')}
            className="hud-panel hud-panel-rose"
            style={{ padding: '24px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', background: 'rgba(244, 63, 94, 0.12)', borderRadius: 'var(--radius-md)' }}>
                <ShieldAlert size={22} color="var(--neon-rose)" />
              </div>
              <div>
                <h3 style={{ fontSize: '17px' }}>Emergency SOS Radar</h3>
                <span style={{ fontSize: '12px', color: 'var(--neon-rose)' }}>3-second safety beacon</span>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Instant broadcast of live GPS telemetry to ambulance, fire department, and municipal emergency control towers.
            </p>
            <span style={{ color: 'var(--neon-rose)', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Emergency Radar Beacon <ArrowUpRight size={14} />
            </span>
          </div>

          {/* Card 4: Property Tax */}
          <div 
            onClick={() => onNavigate('tax')}
            className="hud-panel"
            style={{ padding: '24px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.12)', borderRadius: 'var(--radius-md)' }}>
                <Zap size={22} color="var(--neon-emerald)" />
              </div>
              <div>
                <h3 style={{ fontSize: '17px' }}>Municipal Tax Calculator</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Unit area value assessment</span>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Calculate annual municipal property taxes across Metro Core, Suburban, and Peripheral zones with early-bird rebate calculation.
            </p>
            <span style={{ color: 'var(--neon-emerald)', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Open Tax Calculator <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
