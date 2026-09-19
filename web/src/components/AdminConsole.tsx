import React, { useState } from 'react';
import { Radio, ShieldAlert, CheckCircle2, Clock, AlertTriangle, Send, RefreshCw, BarChart3 } from 'lucide-react';
import { Complaint } from '../services/api';

export const AdminConsole: React.FC = () => {
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastActive, setBroadcastActive] = useState(false);

  const [triageTickets, setTriageTickets] = useState<Complaint[]>([
    {
      _id: 'TRG-901',
      title: 'Power grid transformer overheating at Substation 7',
      description: 'Thermal cameras detect 92C core temperature. Automated cooling backup engaged.',
      category: 'Electricity',
      department: 'Power & Grid Utilities',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      votes: 18,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'TRG-902',
      title: 'Main pipeline pressure drop across Sector 14',
      description: 'Flow meter telemetry alerts possible subterranean fissure.',
      category: 'Water Supply',
      department: 'Water & Sewerage Authority',
      status: 'PENDING',
      priority: 'HIGH',
      votes: 42,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      _id: 'TRG-903',
      title: 'Traffic signal synchronization fault on Central Ring Rd',
      description: 'Autonomous timing fallback active; manual patrol dispatched.',
      category: 'Traffic',
      department: 'Traffic Enforcement Bureau',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      votes: 9,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ]);

  const updateTicketStatus = (id: string, newStatus: Complaint['status']) => {
    setTriageTickets(prev =>
      prev.map(t => t._id === id ? { ...t, status: newStatus } : t)
    );
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    setBroadcastActive(true);
    setTimeout(() => {
      setBroadcastActive(false);
      setBroadcastMsg('');
    }, 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-amber">OFFICER CREDENTIALS VERIFIED</span>
            <span className="badge badge-cyan">ICCC NODE 01</span>
          </div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={24} color="var(--neon-amber)" />
            Command Center & Department Triage
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ fontSize: '13px', gap: '6px' }}>
            <RefreshCw size={14} /> Re-sync Dispatch Stream
          </button>
        </div>
      </div>

      {/* Broadcast Announcement Bar */}
      <div className="hud-panel hud-panel-cyan" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={17} color="var(--neon-cyan)" /> Push Instant Citywide Announcement
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          Transmits priority alert banner to all active citizen sessions and mobile nodes.
        </p>

        {broadcastActive ? (
          <div style={{
            padding: '14px 20px',
            background: 'rgba(0, 240, 255, 0.15)',
            border: '1px solid var(--neon-cyan)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--neon-cyan)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
          }}>
            BROADCAST ACTIVE: "{broadcastMsg}" transmitted to 240,000 citizen devices.
          </div>
        ) : (
          <form onSubmit={handleBroadcast} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g. Precautionary storm warning issued for low-lying sectors..."
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              className="hud-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 20px' }}>
              <Send size={15} />
              <span>Broadcast</span>
            </button>
          </form>
        )}
      </div>

      {/* Live Triage Queue */}
      <div>
        <h3 style={{ fontSize: '18px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="var(--neon-cyan)" /> Live Grievance Triage Queue
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {triageTickets.map((ticket) => {
            const isCritical = ticket.priority === 'CRITICAL';
            return (
              <div
                key={ticket._id}
                className={`hud-panel ${isCritical ? 'hud-panel-rose' : 'hud-panel-cyan'}`}
                style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
              >
                <div style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '11px' }}>{ticket._id}</span>
                    <span className={`badge ${isCritical ? 'badge-rose' : 'badge-amber'}`} style={{ fontSize: '11px' }}>
                      {ticket.priority}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ticket.department}</span>
                  </div>
                  <h4 style={{ fontSize: '15px', marginBottom: '4px' }}>{ticket.title}</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{ticket.description}</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {ticket.status !== 'RESOLVED' ? (
                    <>
                      <button
                        onClick={() => updateTicketStatus(ticket._id, 'IN_PROGRESS')}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Dispatch Squad
                      </button>
                      <button
                        onClick={() => updateTicketStatus(ticket._id, 'RESOLVED')}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        <CheckCircle2 size={14} />
                        Mark Resolved
                      </button>
                    </>
                  ) : (
                    <span className="badge badge-emerald">RESOLVED & ARCHIVED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
