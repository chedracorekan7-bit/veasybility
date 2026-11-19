import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, UserCheck, PhoneCall, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';

export default function Chatbot() {
  const { isChatOpen, toggleChat } = useStore();
  const [messages, setMessages] = useState([
    { text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?", isBot: true },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: '', emailOrPhone: '' });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const messagesEndRef = useRef(null);
  const lastBotMessageRef = useRef(null);

  // Génération ou récupération de l'identifiant de session persistant
  const getSessionId = () => {
    let id = localStorage.getItem('veasybility_chat_session_id');
    if (!id) {
      id = 'cs_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('veasybility_chat_session_id', id);
    }
    return id;
  };

  // Chargement de l'historique lors du premier rendu
  useEffect(() => {
    const sessionId = getSessionId();
    axios
      .get(`${import.meta.env.VITE_API_URL}/chat/history?session_id=${sessionId}`)
      .then((res) => {
        if (res.data.messages && res.data.messages.length > 0) {
          setMessages(res.data.messages);
        }
        if (res.data.lead_captured) {
          setLeadCaptured(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
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
    const sessionId = getSessionId();
    for (let i = 0; i < attempts; i++) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/chat`,
          { message: text, session_id: sessionId },
          { timeout: 20000 }
        );
        if (response.data.lead_captured) {
          setLeadCaptured(true);
        }
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

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.emailOrPhone.trim()) return;

    setIsSubmittingLead(true);
    const sessionId = getSessionId();
    const isEmail = leadForm.emailOrPhone.includes('@');

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/chat/lead`, {
        session_id: sessionId,
        name: leadForm.name.trim() || null,
        email: isEmail ? leadForm.emailOrPhone.trim() : null,
        phone: !isEmail ? leadForm.emailOrPhone.trim() : null,
      });

      setLeadCaptured(true);
      setShowLeadForm(false);
      setMessages((prev) => [
        ...prev,
        {
          text: `Merci ${leadForm.name || ''} ! Vos coordonnées ont bien été enregistrées. Notre équipe vous recontactera très rapidement.`,
          isBot: true,
        },
      ]);
      setLeadForm({ name: '', emailOrPhone: '' });
    } catch {
      // Ignorer ou notifier
    } finally {
      setIsSubmittingLead(false);
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
            style={{ height: '520px', maxHeight: '82vh' }}
          >
            {/* HEADER */}
            <div className="bg-bg p-4 border-b border-border flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-2xl rounded-full" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <div>
                  <h3 className="font-bold text-foreground text-sm">
                    Mr <span className="text-primary">Easy</span>
                  </h3>
                  <p className="text-[10px] text-muted flex items-center gap-1">
                     {leadCaptured ? 'Contact enregistré !' : 'En ligne'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10">
                {!leadCaptured && (
                  <button
                    onClick={() => setShowLeadForm(!showLeadForm)}
                    title="Laisser mes coordonnées"
                    className="text-[11px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-2 py-1 rounded-full transition-colors flex items-center gap-1"
                  >
                    <PhoneCall size={11} />
                    <span>Rappel</span>
                  </button>
                )}
                {leadCaptured && (
                  <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={11} />
                    <span>Notifié</span>
                  </span>
                )}
                <button
                  onClick={toggleChat}
                  className="text-muted hover:text-foreground transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* FORMULAIRE RAPIDE DE COORDONNÉES (COLLAPSIBLE) */}
            <AnimatePresence>
              {showLeadForm && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleLeadSubmit}
                  className="bg-surface-input border-b border-border p-3 flex flex-col gap-2 overflow-hidden text-xs"
                >
                  <p className="text-muted text-[11px] font-medium">
                    Laissez vos coordonnées pour un devis ou rappel rapide :
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Votre prénom / nom"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      className="bg-bg border border-border rounded-lg px-2.5 py-1.5 text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Email ou WhatsApp"
                      value={leadForm.emailOrPhone}
                      onChange={(e) => setLeadForm({ ...leadForm, emailOrPhone: e.target.value })}
                      className="bg-bg border border-border rounded-lg px-2.5 py-1.5 text-foreground placeholder:text-muted/60 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setShowLeadForm(false)}
                      className="text-muted hover:text-foreground px-2 py-1 rounded text-[11px]"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingLead || !leadForm.emailOrPhone.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-3 py-1 rounded-lg text-[11px] transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <UserCheck size={12} />
                      <span>{isSubmittingLead ? 'Envoi...' : 'Valider'}</span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* MESSAGES */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {messages.map((msg, idx) => {
                const isLastBot =
                  msg.isBot &&
                  idx ===
                    messages
                      .map((m, i) => (m.isBot ? i : -1))
                      .filter((i) => i !== -1)
                      .at(-1);

                return (
                  <div
                    key={idx}
                    ref={isLastBot ? lastBotMessageRef : null}
                    className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                        msg.isBot
                          ? 'bg-foreground/5 text-foreground/90 rounded-tl-sm border border-border/40'
                          : 'bg-primary text-primary-foreground font-medium rounded-tr-sm shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 bg-foreground/5 border border-border/40 rounded-2xl rounded-tl-sm text-muted text-xs flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* QUESTIONS PRÉDÉFINIES */}
            {messages.length === 1 && (
              <div className="p-3 flex flex-wrap gap-1.5 border-t border-border bg-bg/50">
                {predefinedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-[11px] px-3 py-1 bg-foreground/5 hover:bg-primary/20 text-muted hover:text-primary rounded-full transition-colors border border-border hover:border-primary/30"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* INPUT DE SAISIE */}
            <div className="p-3 bg-bg border-t border-border">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Posez votre question à Mr Easy..."
                  className="w-full bg-surface-input text-xs text-foreground rounded-full pl-4 pr-11 py-2.5 border border-border focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-1.5 w-7 h-7 flex items-center justify-center bg-primary rounded-full text-primary-foreground hover:scale-105 disabled:opacity-50 transition-transform"
                >
                  <Send size={12} />
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
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6 right-4 md:right-6 w-11 h-11 md:w-14 md:h-14 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_var(--theme-shadow-primary)] z-50 text-primary-foreground transition-transform"
      >
        {isChatOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </motion.button>
    </>
  );
}
