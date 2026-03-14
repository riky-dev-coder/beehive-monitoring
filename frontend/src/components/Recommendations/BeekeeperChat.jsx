import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

const SUGGESTED_QUESTIONS = [
  '¿Cómo interpreto una alerta de temperatura crítica?',
  '¿Cuándo debo revisar la colmena después de una alerta?',
  '¿Qué significa una pérdida de peso repentina?',
  '¿Cómo prevenir el síndrome de colapso de colonias?',
];

const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-amber-400 opacity-60 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
      />
    ))}
  </div>
);

const Message = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm
          ${isUser
            ? 'bg-blue-600/20 border border-blue-600/40 text-blue-400'
            : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
          }`}
      >
        {isUser ? '👤' : '🐝'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-blue-600/20 border border-blue-600/30 text-gray-200 rounded-tr-sm'
            : 'bg-gray-800/80 border border-gray-700/60 text-gray-300 rounded-tl-sm'
          }`}
      >
        {msg.content}
        <div className={`text-[10px] mt-1.5 ${isUser ? 'text-blue-400/50 text-right' : 'text-gray-600'}`}>
          {msg.time}
        </div>
      </div>
    </div>
  );
};

const BeekeeperChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente apícola. Puedo ayudarte a interpretar alertas, recomendaciones y responder preguntas sobre el manejo de tus colmenas. ¿En qué puedo ayudarte hoy?',
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const now = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content, time: now };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowSuggested(false);

    // Build history for the API (exclude timestamps)
    const history = messages.map(({ role, content }) => ({ role, content }));

    try {
      const { data } = await api.post('/recommendations/chat', {
        message: content,
        history,
      });
      const aiTime = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response, time: aiTime },
      ]);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      const errTime = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, ocurrió un error al procesar tu consulta. Por favor intenta de nuevo.',
          time: errTime,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-800">
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-base">
          🐝
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-200">Asistente Apícola IA</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-gray-500">En línea · experto en colmenas</span>
          </div>
        </div>
        {/* Clear chat */}
        <button
          onClick={() => {
            setMessages([{
              role: 'assistant',
              content: '¡Hola! Soy tu asistente apícola. ¿En qué puedo ayudarte hoy?',
              time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
            }]);
            setShowSuggested(true);
          }}
          className="ml-auto p-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-gray-800 transition-colors"
          title="Nueva conversación"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 min-h-0
                      scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-sm">
              🐝
            </div>
            <div className="bg-gray-800/80 border border-gray-700/60 rounded-2xl rounded-tl-sm">
              <TypingDots />
            </div>
          </div>
        )}

        {/* Suggested questions */}
        {showSuggested && !loading && messages.length <= 1 && (
          <div className="flex flex-col gap-2 mt-2">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wider">
              Preguntas frecuentes
            </p>
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-left text-xs text-gray-400 bg-gray-800/50 border border-gray-700/50
                           hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/5
                           px-3 py-2 rounded-xl transition-all duration-200"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-3 border-t border-gray-800">
        <div className="flex items-end gap-2 bg-gray-800/60 border border-gray-700/60
                        rounded-2xl px-4 py-2.5 focus-within:border-amber-500/40 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre tu colmena…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600
                       resize-none outline-none max-h-28 overflow-y-auto leading-relaxed"
            style={{ fieldSizing: 'content' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400
                       disabled:bg-gray-700 disabled:cursor-not-allowed
                       flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-black" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-700 text-center mt-2">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
};

export default BeekeeperChat;