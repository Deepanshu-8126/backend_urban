import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, ThumbsUp, RefreshCw } from 'lucide-react';
import { api, Complaint } from '../../services/api';

interface ComplaintHubScreenProps {
  isDark: boolean;
  onBack: () => void;
}

export const ComplaintHubScreen: React.FC<ComplaintHubScreenProps> = ({ isDark, onBack }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await api.getComplaints();
      setComplaints(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpvote = (id: string) => {
    setComplaints(prev =>
      prev.map(c => (c._id === id ? { ...c, votes: (c.votes || 0) + 1 } : c))
    );
  };

  const cardBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
  const textColor = isDark ? '#FFFFFF' : '#1E293B';
  const subtextColor = isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748B';

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
          My Grievances
        </span>
        <button
          onClick={fetchComplaints}
          style={{ color: textColor, padding: '6px', borderRadius: '50%' }}
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: subtextColor }}>
            Loading your grievance records...
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: subtextColor }}>
            No complaints filed yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {complaints.map((item) => {
              const isResolved = item.status === 'RESOLVED';
              const isInProgress = item.status === 'IN_PROGRESS';
              const statusColor = isResolved ? '#4CAF50' : isInProgress ? '#448AFF' : '#FFAB40';

              return (
                <div
                  key={item._id}
                  style={{
                    backgroundColor: cardBg,
                    border: `1.5px solid ${borderColor}`,
                    borderRadius: '20px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.25)' : '0 4px 14px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: `${statusColor}1A`,
                      color: statusColor,
                      border: `1px solid ${statusColor}4D`,
                    }}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '12px', color: subtextColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: textColor, lineHeight: 1.3 }}>
                    {item.title}
                  </h4>

                  <p style={{ fontSize: '13px', color: subtextColor, lineHeight: 1.4 }}>
                    {item.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '10px',
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: subtextColor }}>
                      <MapPin size={13} color="#448AFF" />
                      <span>{item.location?.address || 'Civic Sector'}</span>
                    </div>

                    <button
                      onClick={() => handleUpvote(item._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.04)',
                        color: textColor,
                        fontSize: '12px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <ThumbsUp size={13} color="#FFAB40" />
                      <span>Verify ({item.votes || 0})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
