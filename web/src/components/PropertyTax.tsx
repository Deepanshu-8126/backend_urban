import React, { useState } from 'react';
import { Calculator, DollarSign, CheckCircle2, ShieldAlert, Receipt, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const PropertyTax: React.FC = () => {
  const [area, setArea] = useState<number>(1200);
  const [zone, setZone] = useState<string>('Zone A (Metro Core)');
  const [isCommercial, setIsCommercial] = useState<boolean>(false);
  const [paidReceipt, setPaidReceipt] = useState<string | null>(null);

  const calc = api.calculatePropertyTax(area, zone, isCommercial);

  const handlePay = () => {
    const receipt = `MUNI-TAX-REC-${Math.floor(100000 + Math.random() * 900000)}`;
    setPaidReceipt(receipt);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      <div>
        <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calculator size={24} color="var(--neon-emerald)" />
          Municipal Property Tax Assessment Engine
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Automated Unit Area Value (UAV) assessment based on municipal zoning bylaws
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
      }}>
        {/* Left Input Configuration */}
        <div className="hud-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Property Parameters</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Built-up area */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Built-Up Carpet Area</label>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', fontWeight: 700 }}>
                  {area} sq. ft.
                </span>
              </div>
              <input
                type="range"
                min={300}
                max={6000}
                step={50}
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--neon-cyan)',
                  cursor: 'pointer',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>300 sq.ft</span>
                <span>6000 sq.ft</span>
              </div>
            </div>

            {/* Zone Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Municipal Ward Zone
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="hud-select"
              >
                <option value="Zone A (Metro Core)">Zone A — Central Metro Core (Highest UAV)</option>
                <option value="Zone B (Suburban Urban)">Zone B — Urban Residential Corridor</option>
                <option value="Zone C (Peripheral)">Zone C — Outer Developing Periphery</option>
              </select>
            </div>

            {/* Property Usage Type */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Property Classification
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCommercial(false)}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: !isCommercial ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${!isCommercial ? 'var(--neon-emerald)' : 'var(--border-subtle)'}`,
                    color: !isCommercial ? 'var(--neon-emerald)' : 'var(--text-secondary)',
                  }}
                >
                  Residential
                </button>
                <button
                  type="button"
                  onClick={() => setIsCommercial(true)}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: isCommercial ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isCommercial ? 'var(--neon-cyan)' : 'var(--border-subtle)'}`,
                    color: isCommercial ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                  }}
                >
                  Commercial (2.2x)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Assessment Bill */}
        <div className="hud-panel hud-panel-emerald" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px' }}>Annual Assessment Bill</h3>
              <span className="badge badge-emerald">FY 2026-27</span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '18px',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assessed Base Valuation:</span>
                <span>₹{calc.taxAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neon-emerald)' }}>
                <span>Early Settlement Rebate (10%):</span>
                <span>- ₹{calc.rebate.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Penalties & Late Fees:</span>
                <span>₹0</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                <span>Net Total Payable:</span>
                <span style={{ color: 'var(--neon-emerald)' }}>₹{calc.totalPayable.toLocaleString()}</span>
              </div>
            </div>

            {paidReceipt ? (
              <div style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--border-emerald)',
                textAlign: 'center',
              }}>
                <CheckCircle2 size={24} color="var(--neon-emerald)" style={{ margin: '0 auto 6px auto' }} />
                <h4 style={{ color: 'var(--neon-emerald)', fontSize: '15px' }}>Tax Payment Cleared</h4>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  Transaction Ref: {paidReceipt}
                </div>
                <button
                  onClick={() => setPaidReceipt(null)}
                  className="btn-secondary"
                  style={{ marginTop: '10px', fontSize: '11px', padding: '4px 10px' }}
                >
                  New Assessment
                </button>
              </div>
            ) : (
              <button
                onClick={handlePay}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}
              >
                <span>Authorize Digital Tax Payment</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px' }}>
            * Instant digital receipt generated and synchronized with CityOS Property Registry.
          </div>
        </div>
      </div>
    </div>
  );
};
