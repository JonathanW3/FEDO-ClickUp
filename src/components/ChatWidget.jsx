// components/ChatWidget.jsx
import { useState, useRef, useEffect } from 'react';

const WEBHOOK_URL = 'https://n8n-dev.waopos.com/webhook/89c5da79-c59c-4a16-abc9-88211ff7d44d/chat';

function generateSessionId() {
  return 'session-' + Math.random().toString(36).substring(2, 15);
}

const sessionId = generateSessionId();

function getTime() {
  const now = new Date();
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '¡Hola! ¿En qué puedo ayudarte?', time: getTime() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const time = getTime();
    setMessages(prev => [...prev, { role: 'user', text, time }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId,
          chatInput: text,
        }),
      });

      const data = await res.json();
      const reply = data.output ?? data.text ?? data.message ?? 'Sin respuesta';
      setMessages(prev => [...prev, { role: 'bot', text: reply, time: getTime() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error al conectar con el servidor.', time: getTime() }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const Avatar = () => (
    <div style={{
      width: '32px', height: '32px', borderRadius: '50%',
      background: '#1a2340',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '11px', fontWeight: 700, color: '#fff',
      flexShrink: 0, alignSelf: 'flex-end',
    }}>WP</div>
  );

  return (
    <>
      {open && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '24px',
          width: '380px', height: '560px',
          background: '#eef0f7',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 9999,
          fontFamily: "'Poppins', sans-serif",
        }}>

          {/* Header */}
          <div style={{
            background: '#1e2a45',
            padding: '16px 20px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Logo badge */}
                <div style={{
                  background: 'linear-gradient(135deg, #4f6ef7, #7c3aed)',
                  borderRadius: '8px',
                  width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: '#fff',
                }}>WP</div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px', lineHeight: 1.2 }}>
                    Asistente WebPOS
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>
                    Sistema de Tareas y Soporte
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                width: '32px', height: '32px',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
            {/* Online indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 0 2px rgba(34,197,94,0.25)',
              }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                En línea · Responde en segundos
              </span>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '16px 14px',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '4px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  {msg.role === 'bot' && <Avatar />}
                  <div style={{
                    background: msg.role === 'user' ? '#4f6ef7' : '#ffffff',
                    color: msg.role === 'user' ? '#fff' : '#1e293b',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    maxWidth: '260px',
                    whiteSpace: 'pre-wrap',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    {msg.text}
                  </div>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  paddingLeft: msg.role === 'bot' ? '40px' : '0',
                  paddingRight: msg.role === 'user' ? '0' : '0',
                }}>
                  {msg.time}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                <Avatar />
                <div style={{
                  background: '#fff',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  display: 'flex', gap: '4px', alignItems: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '7px', height: '7px', borderRadius: '50%',
                      background: '#94a3b8',
                      animation: 'bounce 1.2s infinite',
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            background: '#fff',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe tu mensaje..."
              rows={1}
              style={{
                flex: 1,
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                padding: '10px 16px',
                fontSize: '13px',
                color: '#1e293b',
                background: '#f8fafc',
                outline: 'none',
                fontFamily: "'Poppins', sans-serif",
                resize: 'none',
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                width: '38px', height: '38px',
                borderRadius: '50%',
                background: loading ? '#c7d2fe' : '#4f6ef7',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '56px', height: '56px',
          borderRadius: '16px',
          background: '#4f6ef7',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(79,110,247,0.45)',
          zIndex: 9999,
          transition: 'transform 0.15s, background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        }
      </button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}