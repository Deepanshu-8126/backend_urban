import React from 'react';
import { ArrowLeft, Bell, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface NotificationsScreenProps {
  isDark: boolean;
  onBack: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ isDark, onBack }) => {
  const notifications = [
    {
      id: '1',
      title: 'Power Grid Maintenance Complete',
      desc: 'Substation 4 has resumed normal operations. All streetlights in Ward 4 are illuminated.',
      time: '12m ago',
      type: 'info',
    },
    {
      id: '2',
      title: 'Grievance Ticket Updated',
      desc: 'Your complaint regarding water pipeline pressure has been marked as IN_PROGRESS.',
      time: '2h ago',
      type: 'success',
    },
    {
      id: '3',
      title: 'Air Quality Precaution Alert',
      desc: 'AQI in Metro Core has reached 124. Sensitive individuals advised to limit outdoor running.',
      time: '5h ago',
      type: 'warning',
    },
  ];

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
          Notifications
        </span>
        <div style={{ width: '32px' }} />
      </div>

      <div style={{ padding: '20px 16px', maxWidth: '580px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              backgroundColor: cardBg,
              border: `1.5px solid ${borderColor}`,
              borderRadius: '20px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: n.type === 'warning' ? 'rgba(255, 171, 64, 0.15)' : 'rgba(68, 138, 255, 0.15)',
              color: n.type === 'warning' ? '#FFAB40' : '#448AFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {n.type === 'warning' ? <AlertTriangle size={18} /> : <Bell size={18} />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>{n.title}</h4>
                <span style={{ fontSize: '11px', color: subtextColor }}>{n.time}</span>
              </div>
              <p style={{ fontSize: '13px', color: subtextColor, lineHeight: 1.4 }}>{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
