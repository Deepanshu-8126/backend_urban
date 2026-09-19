import React, { useState } from 'react';
import { ArrowLeft, Calculator, CheckCircle2, CreditCard, Building } from 'lucide-react';
import { api } from '../../services/api';

interface PropertyTaxScreenProps {
  isDark: boolean;
  onBack: () => void;
}

export const PropertyTaxScreen: React.FC<PropertyTaxScreenProps> = ({ isDark, onBack }) => {
  const [activeTab, setActiveTab] = useState<'calc' | 'nearby'>('calc');
  const [area, setArea] = useState<number>(1200);
  const [propertyType, setPropertyType] = useState('residential');
  const [ward, setWard] = useState('Ward 1');
  const [construction, setConstruction] = useState('rcc');
  const [occupancy, setOccupancy] = useState('self');
  const [receipt, setReceipt] = useState<string | null>(null);

  // Exact fields from Flutter tax_calculator_screen.dart
  const propertyTypes = ['residential', 'commercial', 'industrial', 'mixed', 'hospital', 'hotel', 'open_land'];
  const wards = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'];
  const constructionTypes = ['rcc', 'simple', 'patra_shed'];
  const occupancyTypes = ['self', 'tenanted'];

  const calc = api.calculatePropertyTax(area, ward === 'Ward 1' ? 'Zone A (Metro Core)' : 'Zone B (Suburban Urban)', propertyType === 'commercial');

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
          Property Tax
        </span>
        <div style={{ width: '32px' }} />
      </div>

      {/* Tabs like TabBar in Flutter */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${borderColor}`,
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.5)',
      }}>
        <button
          onClick={() => setActiveTab('calc')}
          style={{
            flex: 1,
            padding: '14px',
            fontSize: '14px',
            fontWeight: 700,
            color: activeTab === 'calc' ? '#4CAF50' : subtextColor,
            borderBottom: activeTab === 'calc' ? '2.5px solid #4CAF50' : '2.5px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Calculate Tax
        </button>
        <button
          onClick={() => setActiveTab('nearby')}
          style={{
            flex: 1,
            padding: '14px',
            fontSize: '14px',
            fontWeight: 700,
            color: activeTab === 'nearby' ? '#4CAF50' : subtextColor,
            borderBottom: activeTab === 'nearby' ? '2.5px solid #4CAF50' : '2.5px solid transparent',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          My Assessments
        </button>
      </div>

      <div style={{ padding: '20px 16px 40px 16px', maxWidth: '580px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'calc' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Parameters Card */}
            <div style={{
              backgroundColor: cardBg,
              border: `1.5px solid ${borderColor}`,
              borderRadius: '24px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              {/* Built-Up Area */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: subtextColor, marginBottom: '6px', textTransform: 'uppercase' }}>
                  Built-Up Area (sq. ft)
                </label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${borderColor}`,
                    color: textColor,
                    fontSize: '16px',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Grid of Dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: subtextColor, marginBottom: '6px', textTransform: 'uppercase' }}>
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${borderColor}`,
                      color: textColor,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    {propertyTypes.map((t) => (
                      <option key={t} value={t} style={{ background: '#0F172A', color: '#fff' }}>
                        {t.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: subtextColor, marginBottom: '6px', textTransform: 'uppercase' }}>
                    Ward Selection
                  </label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${borderColor}`,
                      color: textColor,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    {wards.map((w) => (
                      <option key={w} value={w} style={{ background: '#0F172A', color: '#fff' }}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: subtextColor, marginBottom: '6px', textTransform: 'uppercase' }}>
                    Construction
                  </label>
                  <select
                    value={construction}
                    onChange={(e) => setConstruction(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${borderColor}`,
                      color: textColor,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    {constructionTypes.map((c) => (
                      <option key={c} value={c} style={{ background: '#0F172A', color: '#fff' }}>
                        {c.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: subtextColor, marginBottom: '6px', textTransform: 'uppercase' }}>
                    Occupancy
                  </label>
                  <select
                    value={occupancy}
                    onChange={(e) => setOccupancy(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '12px',
                      backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${borderColor}`,
                      color: textColor,
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  >
                    {occupancyTypes.map((o) => (
                      <option key={o} value={o} style={{ background: '#0F172A', color: '#fff' }}>
                        {o.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Assessment Bill Display */}
            <div style={{
              backgroundColor: cardBg,
              border: `1.5px solid ${borderColor}`,
              borderRadius: '24px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: textColor }}>
                  Assessment Summary
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(76, 175, 80, 0.15)',
                  color: '#4CAF50',
                }}>
                  FY 2026-27
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: subtextColor }}>
                <span>Base Valuation:</span>
                <span>₹{calc.taxAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4CAF50' }}>
                <span>10% Early Rebate:</span>
                <span>- ₹{calc.rebate.toLocaleString()}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: `1px solid ${borderColor}`,
                fontSize: '18px',
                fontWeight: 800,
                color: textColor,
              }}>
                <span>Total Tax Payable:</span>
                <span style={{ color: '#4CAF50' }}>₹{calc.totalPayable.toLocaleString()}</span>
              </div>

              {receipt ? (
                <div style={{
                  padding: '14px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(76, 175, 80, 0.15)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  textAlign: 'center',
                  marginTop: '8px',
                }}>
                  <CheckCircle2 size={24} color="#4CAF50" style={{ margin: '0 auto 4px auto' }} />
                  <div style={{ color: '#4CAF50', fontWeight: 700, fontSize: '14px' }}>Payment Cleared</div>
                  <div style={{ fontSize: '11px', color: subtextColor, fontFamily: 'monospace' }}>Ref: {receipt}</div>
                </div>
              ) : (
                <button
                  onClick={() => setReceipt(`TAX-REC-${Math.floor(100000 + Math.random() * 900000)}`)}
                  style={{
                    marginTop: '8px',
                    padding: '14px',
                    borderRadius: '16px',
                    backgroundColor: '#4CAF50',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(76, 175, 80, 0.35)',
                    cursor: 'pointer',
                  }}
                >
                  <CreditCard size={18} />
                  <span>Pay Property Tax</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: cardBg,
            border: `1.5px solid ${borderColor}`,
            borderRadius: '24px',
            padding: '24px',
            textAlign: 'center',
            color: subtextColor,
            fontSize: '14px',
          }}>
            <Building size={36} color="#4CAF50" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ color: textColor, fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>
              Connected Municipal Property
            </div>
            <div>Ward 1, Sector 4, Civic Plot #104</div>
            <div style={{ fontSize: '12px', marginTop: '6px', color: '#4CAF50', fontWeight: 600 }}>
              Status: Assessment Updated
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
