import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Clock, 
  ThumbsUp, 
  Filter, 
  AlertCircle,
  Send,
  Upload,
  Search
} from 'lucide-react';
import { api, Complaint } from '../services/api';

export const ComplaintsHub: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'create'>('list');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredCategory, setFilteredCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Roads & Potholes');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [locationAddress, setLocationAddress] = useState('');

  const loadComplaints = async () => {
    const list = await api.getComplaints();
    setComplaints(list);
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const departmentMap: Record<string, string> = {
    'Roads & Potholes': 'Public Works Department (PWD)',
    'Electricity': 'Power & Grid Utilities',
    'Water Supply': 'Water & Sewerage Authority',
    'Sanitation': 'Solid Waste Management',
    'Public Health': 'Municipal Health Corps',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      const res = await api.submitComplaint({
        title,
        description,
        category,
        department: departmentMap[category] || 'Municipal Civic Authority',
        priority,
        location: { address: locationAddress || 'GPS Auto-Detected Sector' },
        status: 'PENDING',
        votes: 1,
      });

      setSubmissionSuccess(res?.complaintId || 'CMP-SUCCESS');
      setTitle('');
      setDescription('');
      setLocationAddress('');
      await loadComplaints();
      setTimeout(() => {
        setSubmissionSuccess(null);
        setActiveView('list');
      }, 2500);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = (id: string) => {
    setComplaints(prev => 
      prev.map(c => c._id === id ? { ...c, votes: (c.votes || 0) + 1 } : c)
    );
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesCat = filteredCategory === 'ALL' || c.category.toLowerCase().includes(filteredCategory.toLowerCase());
    const matchesSearch = searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={24} color="var(--neon-cyan)" />
            Municipal Grievance Hub
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Automated department dispatching with SLA enforcement & public accountability
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveView('list')}
            className={activeView === 'list' ? 'btn-primary' : 'btn-secondary'}
          >
            Browse Grievances ({complaints.length})
          </button>
          <button
            onClick={() => setActiveView('create')}
            className={activeView === 'create' ? 'btn-primary' : 'btn-secondary'}
            style={{ gap: '6px' }}
          >
            <Plus size={16} />
            File Grievance
          </button>
        </div>
      </div>

      {activeView === 'create' ? (
        /* Grievance Submission Form */
        <div className="hud-panel hud-panel-cyan" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Submit a Public Infrastructure Issue</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            Our CityBrain AI analyzes your report, tags the municipal ward, and assigns an engineering team automatically.
          </p>

          {submissionSuccess ? (
            <div style={{
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--border-emerald)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
              <h4 style={{ color: 'var(--neon-emerald)', fontSize: '18px', marginBottom: '4px' }}>
                Grievance Registered Successfully
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                Assigned Tracking ID: {submissionSuccess}
              </p>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Redirecting back to public feed...
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep crater pothole opposite Metro Station Gate 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="hud-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Civic Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="hud-select"
                  >
                    <option value="Roads & Potholes">Roads & Potholes</option>
                    <option value="Electricity">Electricity & Streetlights</option>
                    <option value="Water Supply">Water Supply & Pipeline</option>
                    <option value="Sanitation">Solid Waste & Sanitation</option>
                    <option value="Public Health">Public Health & Vector Control</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Urgency Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="hud-select"
                  >
                    <option value="LOW">Low (Routine maintenance)</option>
                    <option value="MEDIUM">Medium (Within 24 hours)</option>
                    <option value="HIGH">High (Immediate hazard)</option>
                    <option value="CRITICAL">Critical (Life/safety risk)</option>
                  </select>
                </div>
              </div>

              {/* Department Auto-Route Preview */}
              <div style={{
                padding: '12px 16px',
                background: 'rgba(0, 240, 255, 0.05)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 240, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Auto-Assigned Department:
                </span>
                <span className="badge badge-cyan">
                  {departmentMap[category] || 'Civic Authority'}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Location / Street Landmark
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="e.g. Near Community Center, Ward 5"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    className="hud-input"
                    style={{ paddingLeft: '38px' }}
                  />
                  <MapPin size={16} color="var(--neon-cyan)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide precise details, when the issue started, and impact on pedestrians or traffic..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="hud-textarea"
                />
              </div>

              {/* Photo Simulation */}
              <div style={{
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                background: 'rgba(0,0,0,0.2)',
              }}>
                <Upload size={24} style={{ margin: '0 auto 8px auto', display: 'block', color: 'var(--neon-cyan)' }} />
                <span style={{ fontSize: '13px', display: 'block' }}>Drag and drop evidence photograph or click to attach</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Supports JPG, PNG up to 10MB</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActiveView('list')} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ minWidth: '180px' }}>
                  {submitting ? 'Transmitting to Ward...' : (
                    <>
                      <span>Transmit Ticket</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Grievance Public List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filter and Search Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {['ALL', 'Roads', 'Electricity', 'Water', 'Sanitation'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilteredCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    background: filteredCategory === cat ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${filteredCategory === cat ? 'var(--neon-cyan)' : 'var(--border-subtle)'}`,
                    color: filteredCategory === cat ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hud-input"
                style={{ paddingLeft: '34px', paddingBottom: '8px', paddingTop: '8px', fontSize: '13px' }}
              />
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
            {filteredComplaints.map((item) => {
              const isResolved = item.status === 'RESOLVED';
              const isInProgress = item.status === 'IN_PROGRESS';
              const isCritical = item.priority === 'CRITICAL';

              return (
                <div 
                  key={item._id} 
                  className={`hud-panel ${isCritical ? 'hud-panel-rose' : isInProgress ? 'hud-panel-cyan' : 'hud-panel-emerald'}`}
                  style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className={`badge ${
                        isResolved ? 'badge-emerald' : isInProgress ? 'badge-cyan' : 'badge-amber'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <span style={{ 
                        fontSize: '11px', 
                        fontFamily: 'var(--font-mono)',
                        color: isCritical ? 'var(--neon-rose)' : 'var(--text-muted)',
                        fontWeight: isCritical ? 700 : 500,
                      }}>
                        PRIORITY: {item.priority}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '16px', marginBottom: '8px', lineHeight: 1.3 }}>
                      {item.title}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px', lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                  </div>

                  <div>
                    {/* Location & Dept */}
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-muted)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '4px',
                      marginBottom: '16px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={13} color="var(--neon-cyan)" />
                        <span>{item.location?.address || 'Civic Center'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={13} color="var(--text-muted)" />
                        <span>{item.department}</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>

                      <button
                        onClick={() => handleUpvote(item._id)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px', gap: '6px' }}
                      >
                        <ThumbsUp size={13} />
                        <span>Verify ({item.votes || 0})</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
