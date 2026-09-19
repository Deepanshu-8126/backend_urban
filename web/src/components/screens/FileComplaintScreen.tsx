import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Camera, 
  Mic, 
  Send, 
  CheckCircle, 
  Layers 
} from 'lucide-react';
import { api } from '../../services/api';

interface FileComplaintScreenProps {
  isDark: boolean;
  onBack: () => void;
}

export const FileComplaintScreen: React.FC<FileComplaintScreenProps> = ({ isDark, onBack }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Roads');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [photoAttached, setPhotoAttached] = useState(false);
  const [voiceRecorded, setVoiceRecorded] = useState(false);

  const categories = [
    'Roads', 'Garbage', 'Water', 'Electricity', 'Traffic', 'Crime', 'Street Light', 'Sewerage', 'Other'
  ];

  // Auto category detection like citizen_form.dart _onTitleChanged
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const lower = val.toLowerCase();
    if (lower.includes('pothole') || lower.includes('road')) setSelectedCategory('Roads');
    else if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste')) setSelectedCategory('Garbage');
    else if (lower.includes('water') || lower.includes('pipe') || lower.includes('leak')) setSelectedCategory('Water');
    else if (lower.includes('light') || lower.includes('lamp')) setSelectedCategory('Street Light');
    else if (lower.includes('electric') || lower.includes('power') || lower.includes('wire')) setSelectedCategory('Electricity');
    else if (lower.includes('traffic') || lower.includes('jam')) setSelectedCategory('Traffic');
    else if (lower.includes('sewer') || lower.includes('drain')) setSelectedCategory('Sewerage');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    try {
      const res = await api.submitComplaint({
        title,
        description,
        category: selectedCategory,
        priority: 'MEDIUM',
        location: { address: 'GPS Locked: Sector 4, Civic Road' },
        status: 'PENDING',
      });
      setSuccessId(res?.complaintId || `CMP-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setIsSubmitting(false);
    }
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
          File Grievance
        </span>
        <div style={{ width: '32px' }} />
      </div>

      <div style={{ padding: '20px 16px 40px 16px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        {successId ? (
          <div style={{
            padding: '36px 20px',
            borderRadius: '24px',
            backgroundColor: cardBg,
            border: `1.5px solid ${borderColor}`,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(76, 175, 80, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4CAF50',
            }}>
              <CheckCircle size={36} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: textColor }}>
              Complaint Registered!
            </h3>
            <p style={{ color: subtextColor, fontSize: '14px', maxWidth: '380px' }}>
              Your ticket has been dispatched to the municipal ward engineering unit.
            </p>
            <div style={{
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'rgba(68, 138, 255, 0.12)',
              color: '#448AFF',
              fontFamily: 'monospace',
              fontSize: '14px',
              fontWeight: 'bold',
            }}>
              Ticket ID: {successId}
            </div>
            <button
              onClick={onBack}
              style={{
                marginTop: '12px',
                padding: '12px 24px',
                borderRadius: '16px',
                backgroundColor: '#FF5252',
                color: '#FFFFFF',
                fontWeight: 'bold',
                fontSize: '15px',
                boxShadow: '0 4px 14px rgba(255, 82, 82, 0.35)',
              }}
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Title Input */}
            <div style={{
              backgroundColor: cardBg,
              border: `1.5px solid ${borderColor}`,
              borderRadius: '20px',
              padding: '16px',
            }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: subtextColor, marginBottom: '8px', textTransform: 'uppercase' }}>
                Issue Summary *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Street light flickering on 5th Avenue"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: textColor,
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Category Pills (Matching citizen_form _categories) */}
            <div style={{
              backgroundColor: cardBg,
              border: `1.5px solid ${borderColor}`,
              borderRadius: '20px',
              padding: '16px',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: subtextColor, marginBottom: '12px', textTransform: 'uppercase' }}>
                <Layers size={14} /> Category (Auto-Detected)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 500,
                        backgroundColor: isSelected ? 'rgba(255, 82, 82, 0.15)' : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
                        border: `1px solid ${isSelected ? '#FF5252' : 'transparent'}`,
                        color: isSelected ? '#FF5252' : textColor,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location Pill */}
            <div style={{
              backgroundColor: cardBg,
              border: `1.5px solid ${borderColor}`,
              borderRadius: '20px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(68, 138, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#448AFF',
                flexShrink: 0,
              }}>
                <MapPin size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: subtextColor, fontWeight: 600 }}>DETECTED LOCATION</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>GPS Auto-Locked: Sector 4, Civic Boulevard</div>
              </div>
            </div>

            {/* Media Evidence Actions (Camera & Voice Note from Flutter) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setPhotoAttached(!photoAttached)}
                style={{
                  padding: '14px',
                  borderRadius: '18px',
                  backgroundColor: cardBg,
                  border: `1.5px solid ${photoAttached ? '#4CAF50' : borderColor}`,
                  color: photoAttached ? '#4CAF50' : textColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                <Camera size={18} color={photoAttached ? '#4CAF50' : '#FF5252'} />
                <span>{photoAttached ? 'Photo Attached' : 'Capture Photo'}</span>
              </button>

              <button
                type="button"
                onClick={() => setVoiceRecorded(!voiceRecorded)}
                style={{
                  padding: '14px',
                  borderRadius: '18px',
                  backgroundColor: cardBg,
                  border: `1.5px solid ${voiceRecorded ? '#4CAF50' : borderColor}`,
                  color: voiceRecorded ? '#4CAF50' : textColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                <Mic size={18} color={voiceRecorded ? '#4CAF50' : '#448AFF'} />
                <span>{voiceRecorded ? 'Audio Attached' : 'Record Voice'}</span>
              </button>
            </div>

            {/* Description Textarea */}
            <div style={{
              backgroundColor: cardBg,
              border: `1.5px solid ${borderColor}`,
              borderRadius: '20px',
              padding: '16px',
            }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: subtextColor, marginBottom: '8px', textTransform: 'uppercase' }}>
                Full Details (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Describe landmark details or urgency..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: textColor,
                  fontSize: '14px',
                  resize: 'none',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: '10px',
                padding: '16px',
                borderRadius: '18px',
                backgroundColor: '#FF5252',
                color: '#FFFFFF',
                fontWeight: 'bold',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(255, 82, 82, 0.4)',
                cursor: 'pointer',
              }}
            >
              {isSubmitting ? 'Transmitting...' : (
                <>
                  <Send size={18} />
                  <span>Submit Grievance</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
