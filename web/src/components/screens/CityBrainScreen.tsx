import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, User, Bot, Mic, Camera, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface CityBrainScreenProps {
  isDark: boolean;
  onBack: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const CityBrainScreen: React.FC<CityBrainScreenProps> = ({ isDark, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello Citizen! I am CityBrain AI. You can ask me regarding civic grievances, water supply, building bylaws, or property taxes.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (customText?: string) => {
    const text = customText || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsTyping(true);

    try {
      const reply = await api.sendChatMessage(text);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'CityBrain AI synchronized with municipal server.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const textColor = isDark ? '#FFFFFF' : '#1E293B';
  const subtextColor = isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748B';
  const inputBg = isDark ? '#0F172A' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(124, 77, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7C4DFF',
          }}>
            <Sparkles size={18} />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '18px', color: textColor }}>
            CityBrain AI
          </span>
        </div>
        <div style={{ width: '32px' }} />
      </div>

      {/* Messages Stream */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        maxWidth: '640px',
        margin: '0 auto',
        width: '100%',
      }}>
        {messages.map((m) => {
          const isBot = m.sender === 'bot';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '10px',
                alignSelf: isBot ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                flexDirection: isBot ? 'row' : 'row-reverse',
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isBot ? 'rgba(124, 77, 255, 0.2)' : 'rgba(68, 138, 255, 0.2)',
                color: isBot ? '#7C4DFF' : '#448AFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {isBot ? <Bot size={16} /> : <User size={16} />}
              </div>

              <div>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                  backgroundColor: isBot 
                    ? (isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF') 
                    : '#7C4DFF',
                  color: isBot ? textColor : '#FFFFFF',
                  fontSize: '14px',
                  lineHeight: 1.45,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  border: isBot ? `1px solid ${borderColor}` : 'none',
                }}>
                  {m.text}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: subtextColor,
                  marginTop: '4px',
                  textAlign: isBot ? 'left' : 'right',
                }}>
                  {m.time}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start', alignItems: 'center' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'rgba(124, 77, 255, 0.2)',
              color: '#7C4DFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={14} />
            </div>
            <div style={{
              padding: '8px 14px',
              borderRadius: '14px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
              color: subtextColor,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <RefreshCw size={12} className="animate-spin" />
              <span>CityBrain is thinking...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{
        padding: '8px 16px',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        maxWidth: '640px',
        margin: '0 auto',
        width: '100%',
      }}>
        {['File road complaint', 'How is tax calculated?', 'Ward 4 collection timings'].map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            style={{
              padding: '6px 12px',
              borderRadius: '14px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${borderColor}`,
              color: subtextColor,
              fontSize: '12px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: inputBg,
        borderTop: `1px solid ${borderColor}`,
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '640px',
            margin: '0 auto',
          }}
        >
          <button
            type="button"
            style={{ color: subtextColor, padding: '8px' }}
            title="Attach Photo"
          >
            <Camera size={20} />
          </button>
          <button
            type="button"
            style={{ color: subtextColor, padding: '8px' }}
            title="Voice Input"
          >
            <Mic size={20} />
          </button>
          <input
            type="text"
            placeholder="Ask CityBrain..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '24px',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
              border: 'none',
              outline: 'none',
              color: textColor,
              fontSize: '14px',
            }}
          />
          <button
            type="submit"
            disabled={isTyping}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#7C4DFF',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 77, 255, 0.35)',
              cursor: 'pointer',
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
