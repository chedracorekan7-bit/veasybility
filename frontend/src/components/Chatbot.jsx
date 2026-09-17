import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';

export default function Chatbot() {
  const { isChatOpen, toggleChat } = useStore();
  const [messages, setMessages] = useState([
    { text: "Bonjour. Comment vas tu ?", isBot: true },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const lastBotMessageRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
    }
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.isBot && lastBotMessageRef.current) {
      lastBotMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const predefinedQuestions = [
    'Quels sont vos services ?',
    'Comment démarrer un projet ?',
    'Faites-vous du développement mobile ?',
  ];

  const sendWithRetry = async (text, attempts = 3, delay = 1000) => {
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/chat`,
          { message: text },
          { timeout: 15000 }
        );
        return response.data.reply;
      } catch (err) {
        const isNetworkError = !err.response;
        if (isNetworkError && i < attempts - 1) {
          await new Promise((res) => setTimeout(res, delay * (i + 1)));
          continue;
        }
        if (isNetworkError) throw new Error('network');
        if (err.response?.status === 503) throw new Error('unavailable');
        throw new Error('server');
      }
    }
  };

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { text, isBot: false }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const reply = await sendWithRetry(text);
      setMessages((prev) => [...prev, { text: reply, isBot: true }]);
    } catch (err) {
      const errorText =
        err.message === 'network'
          ? 'Connexion instable. Vérifiez votre réseau et réessayez.'
          : err.message === 'unavailable'
          ? 'Service temporairement indisponible. Réessayez dans un instant.'
          : 'Une erreur est survenue côté serveur. Réessayez dans un moment.';
      setMessages((prev) => [...prev, { text: errorText, isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-24 right-4 md:right-6 left-4 md:left-auto md:w-80 lg:w-96 bg-surface-elevated border border-border-strong rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-colors duration-300"
            style={{ height: '500px', maxHeight: '80vh' }}
          >
            <div className="bg-bg p-4 border-b border-border flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-2xl rounded-full" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h3 className="font-bold text-foreground">Mr <span className='text-primary'>Easy</span></h3>
              </div>
              <button onClick={toggleChat} className="text-muted hover:text-foreground transition-colors z-10">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
              {messages.map((msg, idx) => {
                const isLastBot = msg.isBot && idx === messages.map((m, i) => m.isBot ? i : -1).filter(i => i !== -1).at(-1);
                return (
                  <div
                    key={idx}
                    ref={isLastBot ? lastBotMessageRef : null}
                    className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                        msg.isBot
                          ? 'bg-foreground/5 text-foreground/90 rounded-tl-sm'
                          : 'bg-primary text-primary-foreground font-medium rounded-tr-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 bg-foreground/5 rounded-2xl rounded-tl-sm text-muted text-sm flex gap-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="p-3 flex flex-wrap gap-2 border-t border-border">
                {predefinedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-xs px-3 py-1.5 bg-foreground/5 hover:bg-primary/20 text-muted hover:text-primary rounded-full transition-colors border border-border hover:border-primary/30"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="p-3 bg-bg border-t border-border">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Posez votre question..."
                  className="w-full bg-surface-input text-sm text-foreground rounded-full pl-4 pr-12 py-3 border border-border focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-2 w-8 h-8 flex items-center justify-center bg-primary rounded-full text-primary-foreground hover:scale-105 disabled:opacity-50 transition-transform"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))]  md:bottom-6 right-4 md:right-6 w-10 h-10 md:w-14 md:h-14 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_var(--theme-shadow-primary)] z-50 text-primary-foreground"
      >
        {isChatOpen ? <X size={24} className='' /> : <MessageSquare size={24} />}
      </motion.button>
    </>
  );
}
