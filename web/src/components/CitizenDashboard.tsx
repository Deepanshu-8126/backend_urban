import React from 'react';
import { 
  AlertTriangle, 
  History, 
  ShieldAlert, 
  Wind, 
  CreditCard, 
  BarChart3, 
  Sparkles,
  MapPin,
  Sun,
  Moon,
  LayoutGrid,
  Smartphone,
  Maximize2
} from 'lucide-react';

interface CitizenDashboardProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenDrawer: () => void;
  userName: string;
  onNavigate: (screen: string) => void;
  isPhoneShell: boolean;
  onTogglePhoneShell: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  isDark,
  onToggleTheme,
  onOpenDrawer,
  userName,
  onNavigate,
  isPhoneShell,
  onTogglePhoneShell,
}) => {
  // Exact 7 services from Flutter citizen_dashboard.dart
  const services = [
    {
      id: 'file-complaint',
      title: 'File Complaint',
      icon: AlertTriangle,
      color: '#FF5252', // Colors.redAccent
    },
    {
      id: 'complaint-hub',
      title: 'Complaint Hub',
      icon: History,
      color: '#FFAB40', // Colors.orangeAccent
    },
    {
      id: 'sos',
      title: 'SOS Emergency',
      icon: ShieldAlert,
      color: '#F44336', // Colors.red
    },
    {
      id: 'aqi',
      title: 'AQI Monitor',
      icon: Wind,
      color: '#64FFDA', // Colors.tealAccent
    },
    {
      id: 'tax',
      title: 'Property Tax',
      icon: CreditCard,
      color: '#4CAF50', // Colors.green
    },
    {
      id: 'funds',
      title: 'Public Funds Tracker',
      icon: BarChart3,
      color: '#009688', // Colors.teal
    },
    {
      id: 'citybrain',
      title: 'CityBrain AI',
      icon: Sparkles,
      color: '#7C4DFF', // Colors.deepPurpleAccent
    },
  ];

  const userInitial = (userName || 'Citizen')[0].toUpperCase();

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Top Header & Actions */}
      <div style={{
        padding: '24px 20px 16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* User Avatar + Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(68, 138, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#448AFF',
            fontWeight: 'bold',
            fontSize: '22px',
            boxShadow: '0 4px 14px rgba(68, 138, 255, 0.25)',
          }}>
            {userInitial}
          </div>

          <div>
            <div style={{
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
              fontSize: '13px',
              letterSpacing: '0.5px',
            }}>
              Welcome Back,
            </div>
            <div style={{
              color: isDark ? '#FFFFFF' : '#1E293B',
              fontWeight: 800,
              fontSize: '22px',
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
            }}>
              {userName || 'Citizen'}
            </div>
          </div>
        </div>

        {/* Action Buttons: Phone Frame Toggle, Theme Switch, Drawer Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View Mode Toggle: Phone Shell vs Full Width */}
          <button
            onClick={onTogglePhoneShell}
            title={isPhoneShell ? 'Expand to Full Width Web View' : 'Switch to Mobile App Viewport'}
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              color: isDark ? '#FFFFFF' : '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isPhoneShell ? <Maximize2 size={18} /> : <Smartphone size={18} />}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title="Toggle Light / Dark Mode"
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              color: isDark ? '#00F0FF' : '#3F51B5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Drawer Grid Button */}
          <button
            onClick={onOpenDrawer}
            title="Open Citizen Menu"
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              color: isDark ? '#FFFFFF' : '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Connected Location Pill */}
      <div style={{ padding: '0 20px 24px 20px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '12px',
          backgroundColor: isDark ? 'rgba(68, 138, 255, 0.1)' : 'rgba(68, 138, 255, 0.06)',
          border: '1px solid rgba(68, 138, 255, 0.25)',
          color: isDark ? '#82B1FF' : '#1976D2',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          <MapPin size={15} color="#448AFF" />
          <span>Smart City · Connected</span>
        </div>
      </div>

      {/* Services Grid (Identical to Flutter GridView.builder) */}
      <div style={{
        padding: '0 16px',
        display: 'grid',
        gridTemplateColumns: isPhoneShell 
          ? 'repeat(2, 1fr)' 
          : 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
      }}>
        {services.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`glass-service-card ${isDark ? 'glass-service-card-dark' : 'glass-service-card-light'}`}
              style={{
                boxShadow: `0 10px 20px -5px ${item.color}${isDark ? '25' : '35'}`,
              }}
            >
              {/* Circular Icon Container */}
              <div 
                className="service-icon-circle"
                style={{
                  backgroundColor: `${item.color}1A`, // withOpacity(0.1)
                }}
              >
                <Icon size={34} color={item.color} />
              </div>

              {/* Title */}
              <div style={{
                color: isDark ? '#FFFFFF' : '#1E293B',
                fontWeight: 'bold',
                fontSize: '15px',
                textAlign: 'center',
                lineHeight: 1.25,
              }}>
                {item.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
