import React from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

interface ProfileScreenProps {
  isDark: boolean;
  onBack: () => void;
  userName: string;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ isDark, onBack, userName }) => {
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
          My Profile
        </span>
        <div style={{ width: '32px' }} />
      </div>

      <div style={{ padding: '24px 16px', maxWidth: '540px', margin: '0 auto', width: '100%' }}>
        <div style={{
          backgroundColor: cardBg,
          border: `1.5px solid ${borderColor}`,
          borderRadius: '24px',
          padding: '28px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(68, 138, 255, 0.2)',
            color: '#448AFF',
            fontWeight: 'bold',
            fontSize: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: textColor }}>{userName}</h3>
          <span style={{
            fontSize: '12px',
            padding: '4px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(76, 175, 80, 0.15)',
            color: '#4CAF50',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <ShieldCheck size={14} /> Registered Citizen
          </span>
        </div>

        <div style={{
          backgroundColor: cardBg,
          border: `1.5px solid ${borderColor}`,
          borderRadius: '20px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Mail size={18} color="#448AFF" />
            <div>
              <div style={{ fontSize: '11px', color: subtextColor }}>Email Address</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>citizen@cityos.gov.in</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Phone size={18} color="#4CAF50" />
            <div>
              <div style={{ fontSize: '11px', color: subtextColor }}>Emergency Contact Phone</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>+91 98765 43210</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={18} color="#FF5252" />
            <div>
              <div style={{ fontSize: '11px', color: subtextColor }}>Municipal Ward</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>Ward 4, North Metropolitan Sector</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
