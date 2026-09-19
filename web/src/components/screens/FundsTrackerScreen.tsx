import React from 'react';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, CheckCircle2, Clock } from 'lucide-react';

interface FundsTrackerScreenProps {
  isDark: boolean;
  onBack: () => void;
}

export const FundsTrackerScreen: React.FC<FundsTrackerScreenProps> = ({ isDark, onBack }) => {
  const projects = [
    {
      id: 'PRJ-101',
      title: 'Underground Stormwater Drainage & Flood Mitigation System',
      ward: 'Ward 4 & 7',
      budget: '₹ 14.5 Crore',
      spent: '₹ 11.2 Crore',
      progress: 78,
      status: 'ONGOING',
    },
    {
      id: 'PRJ-102',
      title: 'Solar Powered LED Streetlight Replacement Across 24 Wards',
      ward: 'All Wards',
      budget: '₹ 8.2 Crore',
      spent: '₹ 8.2 Crore',
      progress: 100,
      status: 'COMPLETED',
    },
    {
      id: 'PRJ-103',
      title: 'Automated Solid Waste Segregation & Bio-Methanation Plant',
      ward: 'Industrial Zone B',
      budget: '₹ 22.0 Crore',
      spent: '₹ 8.5 Crore',
      progress: 38,
      status: 'ONGOING',
    },
  ];

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
          Public Funds Tracker
        </span>
        <div style={{ width: '32px' }} />
      </div>

      <div style={{ padding: '20px 16px 40px 16px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        {/* KPI Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
          <div style={{
            backgroundColor: cardBg,
            border: `1.5px solid ${borderColor}`,
            borderRadius: '20px',
            padding: '18px',
          }}>
            <div style={{ fontSize: '12px', color: subtextColor, fontWeight: 700 }}>Total Funds Allocated</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#009688', marginTop: '6px' }}>
              ₹ 44.7 Cr
            </div>
            <div style={{ fontSize: '11px', color: subtextColor, marginTop: '4px' }}>FY 2026-27 Municipal Budget</div>
          </div>

          <div style={{
            backgroundColor: cardBg,
            border: `1.5px solid ${borderColor}`,
            borderRadius: '20px',
            padding: '18px',
          }}>
            <div style={{ fontSize: '12px', color: subtextColor, fontWeight: 700 }}>Total Funds Disbursed</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#448AFF', marginTop: '6px' }}>
              ₹ 27.9 Cr
            </div>
            <div style={{ fontSize: '11px', color: subtextColor, marginTop: '4px' }}>62.4% Capital Expenditure</div>
          </div>
        </div>

        {/* Project List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: textColor }}>
            Active Development Projects
          </div>

          {projects.map((proj) => {
            const isDone = proj.status === 'COMPLETED';
            return (
              <div
                key={proj.id}
                style={{
                  backgroundColor: cardBg,
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: '20px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: isDone ? 'rgba(76, 175, 80, 0.15)' : 'rgba(0, 150, 136, 0.15)',
                    color: isDone ? '#4CAF50' : '#009688',
                  }}>
                    {proj.status}
                  </span>
                  <span style={{ fontSize: '12px', color: subtextColor }}>{proj.ward}</span>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 700, color: textColor, lineHeight: 1.3 }}>
                  {proj.title}
                </h4>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: subtextColor }}>
                  <span>Sanctioned: {proj.budget}</span>
                  <span>Spent: {proj.spent}</span>
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${proj.progress}%`,
                    backgroundColor: isDone ? '#4CAF50' : '#009688',
                    borderRadius: '999px',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
