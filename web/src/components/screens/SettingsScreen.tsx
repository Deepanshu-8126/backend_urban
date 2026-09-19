import React from 'react';
import { ArrowLeft, Moon, Bell, Shield, Smartphone, Info } from 'lucide-react';

interface SettingsScreenProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onBack: () => void;
  isPhoneShell: boolean;
  onTogglePhoneShell: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isDark,
  onToggleTheme,
  onBack,
  isPhoneShell,
  onTogglePhoneShell,
}) => {
  const textColor = isDark ? '#FFFFFF' : '#1E293B';
  const subtextColor = isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748B';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className={`flutter-app-bar ${isDark ? 'flutter-app-bar-dark' : 'flutter-app-bar-light'}`}>
        <button onClick={onBack} style={{ color: textColor, padding: '6px' }}>
          <ArrowLeft size={22} />
        </button>
        <span style={{ fontWeight: 'bold', fontSize: '18px', color: textColor }}>
          Settings
        </span>
        <div style={{ width: '32px' }} />
      </div>

      <div style={{ padding: '20px 16px', maxWidth: '580px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Appearance Group */}
        <div style={{
          backgroundColor: cardBg,
          border: `1.5px solid ${borderColor}`,
          borderRadius: '24px',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: subtextColor, textTransform: 'uppercase' }}>
            Appearance & Interface
          </div>

          {/* Dark Mode Switch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Moon size={20} color="#448AFF" />
              <div>
                <div style={{ fontWeight: 600, color: textColor }}>Dark Mode</div>
                <div style={{ fontSize: '12px', color: subtextColor }}>Toggle high-contrast obsidian slate theme</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isDark}
              onChange={onToggleTheme}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#448AFF' }}
            />
          </div>

          {/* Mobile Viewport Switch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: `1px solid ${borderColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Smartphone size={20} color="#7C4DFF" />
              <div>
                <div style={{ fontWeight: 600, color: textColor }}>Mobile Phone Viewport Frame</div>
                <div style={{ fontSize: '12px', color: subtextColor }}>Switch between mobile mockup & expanded desktop</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPhoneShell}
              onChange={onTogglePhoneShell}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#7C4DFF' }}
            />
          </div>
        </div>

        {/* Security & System Info */}
        <div style={{
          backgroundColor: cardBg,
          border: `1.5px solid ${borderColor}`,
          borderRadius: '24px',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: subtextColor, textTransform: 'uppercase' }}>
            System Integrity
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={20} color="#4CAF50" />
            <div>
              <div style={{ fontWeight: 600, color: textColor }}>End-to-End Civic Encryption</div>
              <div style={{ fontSize: '12px', color: subtextColor }}>JWT session + SSL transmission active</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '10px', borderTop: `1px solid ${borderColor}` }}>
            <Info size={20} color="#FFAB40" />
            <div>
              <div style={{ fontWeight: 600, color: textColor }}>UrbanOS Version</div>
              <div style={{ fontSize: '12px', color: subtextColor }}>v1.0.0 (Connected to urban_backend)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
