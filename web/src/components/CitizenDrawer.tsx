import React from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  LogIn, 
  LogOut, 
  X, 
  ShieldCheck 
} from 'lucide-react';

interface CitizenDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  isLoggedIn: boolean;
  userName: string;
  onNavigate: (screen: string) => void;
  onToggleLogin: () => void;
}

export const CitizenDrawer: React.FC<CitizenDrawerProps> = ({
  isOpen,
  onClose,
  isDark,
  isLoggedIn,
  userName,
  onNavigate,
  onToggleLogin,
}) => {
  if (!isOpen) return null;

  const bgPanel = isDark ? '#0F172A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1E293B';
  const subtextColor = isDark ? 'rgba(255, 255, 255, 0.54)' : '#64748B';
  const itemHover = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';

  const handleItemClick = (screen: string) => {
    onClose();
    onNavigate(screen);
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div 
        className="drawer-panel"
        style={{
          backgroundColor: bgPanel,
          borderLeft: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
        }}
      >
        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: 700, 
            color: subtextColor, 
            letterSpacing: '1.5px', 
            textTransform: 'uppercase' 
          }}>
            Citizen Menu
          </span>
          <button 
            onClick={onClose}
            style={{ 
              color: textColor, 
              padding: '6px', 
              borderRadius: '50%',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        {isLoggedIn && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            borderRadius: '16px',
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            marginBottom: '20px',
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(68, 138, 255, 0.2)',
              color: '#448AFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '17px',
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: textColor }}>{userName}</div>
              <div style={{ fontSize: '11px', color: '#448AFF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> Verified Citizen
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {isLoggedIn ? (
            <>
              <button
                onClick={() => handleItemClick('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  color: textColor,
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'background 0.15s ease',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = itemHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <User size={19} color="#448AFF" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => handleItemClick('notifications')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  color: textColor,
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'background 0.15s ease',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = itemHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Bell size={19} color="#FFAB40" />
                <span>Notifications</span>
              </button>

              <button
                onClick={() => handleItemClick('settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  color: textColor,
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'background 0.15s ease',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = itemHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Settings size={19} color="#64748B" />
                <span>Settings</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onClose();
                onToggleLogin();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 14px',
                borderRadius: '12px',
                color: textColor,
                fontSize: '14px',
                fontWeight: 600,
                background: 'rgba(68, 138, 255, 0.12)',
              }}
            >
              <LogIn size={19} color="#448AFF" />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>

        {/* Footer Logout Button */}
        {isLoggedIn && (
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <button
              onClick={onToggleLogin}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px',
                borderRadius: '16px',
                background: 'rgba(255, 82, 82, 0.12)',
                border: '1px solid rgba(255, 82, 82, 0.3)',
                color: '#FF5252',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};
