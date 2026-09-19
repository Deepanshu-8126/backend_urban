import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldAlert, 
  Activity, 
  MessageSquare, 
  Wind, 
  Calculator, 
  Radio, 
  UserCheck,
  Flame
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  onQuickSOS: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin,
  onQuickSOS,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'overview', label: 'City Telemetry', icon: Activity },
    { id: 'complaints', label: 'Grievance Hub', icon: Building2 },
    { id: 'sos', label: 'Emergency SOS', icon: ShieldAlert, badge: 'LIVE' },
    { id: 'citybrain', label: 'CityBrain AI', icon: MessageSquare },
    { id: 'aqi', label: 'Air & Environment', icon: Wind },
    { id: 'tax', label: 'Property Tax', icon: Calculator },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Command Triage', icon: Radio, badge: 'OFFICER' });
  }

  return (
    <header className="sticky top-0 z-50 w-full" style={{
      background: 'rgba(6, 9, 17, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        {/* Brand & Ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0, 240, 255, 0.35)',
          }}>
            <Building2 size={20} color="#030712" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800, 
                fontSize: '18px', 
                letterSpacing: '-0.03em' 
              }}>
                CITY<span style={{ color: 'var(--neon-cyan)' }}>OS</span>
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '10px', padding: '2px 6px' }}>
                v3.4 PRODUCTION
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span className="beacon-dot emerald" />
              <span>CORE DISPATCH ONLINE</span>
              <span>•</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{timeStr} IST</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '4px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          overflowX: 'auto',
          maxWidth: '100%',
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 240, 255, 0.28)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} color={isActive ? 'var(--neon-cyan)' : 'currentColor'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: item.badge === 'LIVE' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                    color: item.badge === 'LIVE' ? 'var(--neon-rose)' : 'var(--neon-violet)',
                    border: `1px solid ${item.badge === 'LIVE' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(139, 92, 246, 0.4)'}`,
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Role Switcher & Emergency Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Role Toggle */}
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              gap: '6px',
              border: isAdmin ? '1px solid var(--neon-amber)' : '1px solid var(--border-subtle)',
              color: isAdmin ? 'var(--neon-amber)' : 'var(--text-secondary)',
            }}
            title="Switch between Citizen Portal and Municipal Admin Mode"
          >
            <UserCheck size={14} />
            <span>{isAdmin ? 'Mode: Admin' : 'Mode: Citizen'}</span>
          </button>

          {/* Quick SOS Trigger */}
          <button
            onClick={onQuickSOS}
            className="btn-danger"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              gap: '6px',
            }}
          >
            <Flame size={15} />
            <span>QUICK SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
