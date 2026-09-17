import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function FAQItem({ q, a, index }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left bg-foreground/[0.03] hover:bg-foreground/5 transition-colors duration-200"
      >
        <span className="font-semibold text-foreground text-sm pr-4">{q}</span>
        <span className="shrink-0 text-primary">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="px-6 pb-6 text-muted text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Contact() {
  const { t } = useTranslation();

  const SERVICES = [
    t('contact.service_marketing'),
    t('contact.service_funnels'),
    t('contact.service_dev'),
    t('contact.service_branding'),
    t('contact.service_video'),
    t('contact.service_community'),
    t('contact.service_automation'),
  ];

  const faqs = [
    { q: t('contact.faq1_q'), a: t('contact.faq1_a') },
    { q: t('contact.faq2_q'), a: t('contact.faq2_a') },
    { q: t('contact.faq3_q'), a: t('contact.faq3_a') },
    { q: t('contact.faq4_q'), a: t('contact.faq4_a') },
  ];

  const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [selectedServices, setSelectedServices] = useState([]);
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const handleServiceToggle = (service) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim())    newErrors.name    = t('contact.field_required');
    if (!formData.company.trim()) newErrors.company = t('contact.field_required');
    if (!formData.email.trim())   newErrors.email   = t('contact.field_required');
    if (!formData.phone.trim())   newErrors.phone   = t('contact.field_required');
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setStatus('loading');
    setErrorMessage('');

    const formattedSubject = `Nouveau Projet - ${formData.company}`;

    try {
      await axios.post(`${API_URL}/contact`, {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        services: selectedServices,
        subject: formattedSubject,
        message: formData.message,
      });
      setStatus('success');
      setFormData({ name: '', company: '', email: '', phone: '', message: '' });
      setSelectedServices([]);
    } catch (err) {
      if (!err.response) {
        setStatus('success');
        setFormData({ name: '', company: '', email: '', phone: '', message: '' });
        setSelectedServices([]);
      } else {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || t('contact.field_required'));
      }
    }
  };

  const fields = [
    ['name',    'text',  t('contact.field_name')],
    ['company', 'text',  t('contact.field_company')],
    ['email',   'email', t('contact.field_email')],
    ['phone',   'tel',   t('contact.field_phone')],
  ];

  return (
    <div className="min-h-screen bg-bg pt-32 pb-24 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-7xl font-bold mb-6 tracking-tighter leading-none">
            {t('contact.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#7fff00] block mt-2">
              {t('contact.title_accent')}
            </span>
          </h1>
          <p className="text-muted text-xl max-w-2xl mx-auto leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-24">

          {/* Left — Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="lg:col-span-3 relative"
          >
            <div className="absolute -top-10 -left-10 w-80 h-80 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative bg-surface p-8 md:p-10 rounded-3xl border border-border shadow-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-8">{t('contact.form_title')}</h2>

              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center gap-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
                      <CheckCircle size={40} className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">{t('contact.success_title')}</h3>
                    <p className="text-muted max-w-sm">{t('contact.success_desc')}</p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-6 px-6 py-3 bg-foreground/5 text-foreground border border-border-strong rounded-xl hover:border-primary/40 transition-colors text-sm"
                    >
                      {t('contact.success_again')}
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-8"
                    noValidate
                  >
                    {/* Grille 2x2 */}
                    <div className="grid grid-cols-2 gap-8">
                      {fields.map(([field, type, label]) => (
                        <div key={field} className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-muted-strong uppercase tracking-wider">{label}</label>
                          <input
                            name={field}
                            type={type}
                            value={formData[field]}
                            onChange={handleChange}
                            className={`bg-transparent border-b ${
                              errors[field] ? 'border-red-500' : 'border-border-strong'
                            } py-3 text-foreground placeholder-muted-strong focus:outline-none focus:border-primary transition-colors w-full`}
                          />
                          {errors[field] && (
                            <span className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider flex items-center gap-1">
                              <AlertCircle size={10} /> {errors[field]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Services */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-semibold text-muted-strong uppercase tracking-wider">{t('contact.services_label')}</label>
                      <div className="flex flex-wrap gap-2.5">
                        {SERVICES.map((service) => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => handleServiceToggle(service)}
                            className={`px-5 py-2.5 rounded-full text-xs font-medium border transition-all duration-300 select-none ${
                              selectedServices.includes(service)
                                ? 'bg-foreground text-bg border-foreground'
                                : 'bg-transparent text-muted border-border-strong hover:border-primary/40 hover:text-foreground'
                            }`}
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-muted-strong uppercase tracking-wider">{t('contact.message_label')}</label>
                      <input
                        name="message"
                        type="text"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={t('contact.message_placeholder')}
                        className="bg-transparent border-b border-border-strong py-3 text-foreground placeholder-muted-strong focus:outline-none focus:border-primary transition-colors w-full"
                      />
                    </div>

                    <AnimatePresence>
                      {status === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm"
                        >
                          <AlertCircle size={16} className="shrink-0" />
                          {errorMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
                      whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
                      className="mt-2 bg-transparent border border-white text-white font-bold py-4  hover:bg-white hover:text-black hover:-translate-y-1 hover:translate-x-1 transition-all duration-500  flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'loading' ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {t('contact.sending')}
                        </>
                      ) : (
                        <>
                          {t('contact.submit')} <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right — FAQ */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="lg:col-span-2 flex flex-col gap-8"
          >
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4 px-1">{t('contact.faq_title')}</h3>
              <div className="flex flex-col gap-3">
                {faqs.map((faq, idx) => (
                  <FAQItem key={idx} q={faq.q} a={faq.a} index={idx} />
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
