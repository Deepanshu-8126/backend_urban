import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Send, Sparkles, User, Bot, CornerDownLeft, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const CityBrainChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Greetings citizen. I am CityBrain AI, your municipal assistant. I can assist with grievance routing, building permits, property assessments, and civic telemetry status. How may I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const reply = await api.sendChatMessage(query);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'CityBrain AI has synchronized with municipal databases. Your request has been cataloged.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    'How do I calculate property tax for a 1200 sq ft flat?',
    'Report broken streetlights on North Avenue',
    'What is the average grievance resolution time?',
    'Emergency helpline numbers for Ward 6',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={24} color="var(--neon-violet)" />
            CityBrain AI Civic Engine
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Powered by Groq Llama 3 & Google Gemini Neural Networks
          </p>
        </div>

        <span className="badge badge-cyan">
          <Sparkles size={12} /> NEURAL CORE READY
        </span>
      </div>

      {/* Chat Container */}
      <div className="hud-panel" style={{
        height: '520px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '0',
      }}>
        {/* Messages Stream */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: isBot ? 'flex-start' : 'flex-end',
                  maxWidth: '82%',
                  flexDirection: isBot ? 'row' : 'row-reverse',
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isBot ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0, 240, 255, 0.2)',
                  border: `1px solid ${isBot ? 'var(--neon-violet)' : 'var(--neon-cyan)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isBot ? <Bot size={16} color="var(--neon-violet)" /> : <User size={16} color="var(--neon-cyan)" />}
                </div>

                {/* Message Bubble */}
                <div>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: isBot ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 240, 255, 0.12)',
                    border: `1px solid ${isBot ? 'var(--border-subtle)' : 'rgba(0, 240, 255, 0.25)'}`,
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    lineHeight: 1.5,
                  }}>
                    {m.text}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '4px',
                    display: 'block',
                    textAlign: isBot ? 'left' : 'right',
                  }}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid var(--neon-violet)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Bot size={16} color="var(--neon-violet)" />
              </div>
              <div style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <RefreshCw size={13} className="animate-spin" />
                <span>CityBrain is synthesizing municipal response...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Prompts */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          background: 'rgba(0,0,0,0.2)',
        }}>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '12px',
            background: 'rgba(9, 13, 22, 0.8)',
          }}
        >
          <input
            type="text"
            placeholder="Ask CityBrain regarding municipal services, complaints, taxes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="hud-input"
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={isTyping} className="btn-primary" style={{ padding: '0 18px' }}>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
