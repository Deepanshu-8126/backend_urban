import React, { useState } from 'react';
import { CitizenDashboard } from './components/CitizenDashboard';
import { CitizenDrawer } from './components/CitizenDrawer';
import { FileComplaintScreen } from './components/screens/FileComplaintScreen';
import { ComplaintHubScreen } from './components/screens/ComplaintHubScreen';
import { SOSScreen } from './components/screens/SOSScreen';
import { AQIScreen } from './components/screens/AQIScreen';
import { PropertyTaxScreen } from './components/screens/PropertyTaxScreen';
import { FundsTrackerScreen } from './components/screens/FundsTrackerScreen';
import { CityBrainScreen } from './components/screens/CityBrainScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { Wifi, Battery, Signal } from 'lucide-react';

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userName] = useState('Deepanshu');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isPhoneShell, setIsPhoneShell] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);
  const togglePhoneShell = () => setIsPhoneShell(!isPhoneShell);
  const goBack = () => setCurrentScreen('dashboard');

  return (
    <div 
      className={isDark ? 'app-container-dark' : 'app-container-light'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: isDark ? '#060911' : '#E2E8F0',
        padding: isPhoneShell ? '24px 12px' : '0',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Phone Shell or Full Responsive Shell */}
      <div 
        className={isPhoneShell ? 'phone-shell' : 'full-shell'}
        style={{
          backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
          backgroundImage: isDark
            ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #000000 100%)'
            : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #FFFFFF 100%)',
          borderRadius: isPhoneShell ? '44px' : '0px',
          border: isPhoneShell ? `8px solid ${isDark ? '#1E293B' : '#CBD5E1'}` : 'none',
          boxShadow: isPhoneShell ? '0 25px 60px -12px rgba(0,0,0,0.7)' : 'none',
          minHeight: isPhoneShell ? '840px' : '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Mobile Status Bar (Visible in Phone Shell) */}
        {isPhoneShell && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 24px 6px 24px',
            fontSize: '12px',
            fontWeight: 700,
            color: isDark ? '#FFFFFF' : '#1E293B',
          }}>
            <span>9:41</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Signal size={13} />
              <Wifi size={13} />
              <Battery size={15} />
            </div>
          </div>
        )}

        {/* Content Screens */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {currentScreen === 'dashboard' && (
            <CitizenDashboard
              isDark={isDark}
              onToggleTheme={toggleTheme}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              userName={userName}
              onNavigate={setCurrentScreen}
              isPhoneShell={isPhoneShell}
              onTogglePhoneShell={togglePhoneShell}
            />
          )}

          {currentScreen === 'file-complaint' && (
            <FileComplaintScreen isDark={isDark} onBack={goBack} />
          )}

          {currentScreen === 'complaint-hub' && (
            <ComplaintHubScreen isDark={isDark} onBack={goBack} />
          )}

          {currentScreen === 'sos' && (
            <SOSScreen isDark={isDark} onBack={goBack} />
          )}

          {currentScreen === 'aqi' && (
            <AQIScreen isDark={isDark} onBack={goBack} />
          )}

          {currentScreen === 'tax' && (
            <PropertyTaxScreen isDark={isDark} onBack={goBack} />
          )}

          {currentScreen === 'funds' && (
            <FundsTrackerScreen isDark={isDark} onBack={goBack} />
          )}

          {currentScreen === 'citybrain' && (
            <CityBrainScreen isDark={isDark} onBack={goBack} />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen isDark={isDark} onBack={goBack} userName={userName} />
          )}

          {currentScreen === 'notifications' && (
            <NotificationsScreen isDark={isDark} onBack={goBack} />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              isDark={isDark}
              onToggleTheme={toggleTheme}
              onBack={goBack}
              isPhoneShell={isPhoneShell}
              onTogglePhoneShell={togglePhoneShell}
            />
          )}
        </div>

        {/* Mobile Home Indicator (Visible in Phone Shell) */}
        {isPhoneShell && (
          <div style={{ padding: '8px 0 12px 0', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '130px',
              height: '4px',
              borderRadius: '999px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)',
            }} />
          </div>
        )}
      </div>

      {/* Slide-Over Citizen Drawer */}
      <CitizenDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isDark={isDark}
        isLoggedIn={isLoggedIn}
        userName={userName}
        onNavigate={setCurrentScreen}
        onToggleLogin={() => setIsLoggedIn(!isLoggedIn)}
      />
    </div>
  );
};

export default App;
