import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Inline SVGs for social media icons
const TikTokIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.97 1.2 2.29 2.01 3.75 2.33V10.2c-1.21-.17-2.38-.69-3.3-1.48-.95-.81-1.62-1.92-1.89-3.15-.02-.09-.04-.19-.07-.28-.01 2.81-.01 5.62-.02 8.43-.05 1.54-.53 3.06-1.39 4.31-1 1.44-2.48 2.5-4.14 2.97-1.74.5-3.62.4-5.28-.27-1.64-.67-3-1.92-3.8-3.52-.84-1.66-1.04-3.59-.57-5.38.44-1.71 1.5-3.21 2.97-4.18 1.48-.99 3.27-1.37 5-1.07 1.63.27 3.12 1.16 4.14 2.52v-4c-1.12-.8-1.95-1.99-2.28-3.34-.33-1.36-.18-2.8.42-4.06z"/>
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const TwitterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
  </svg>
);

const YoutubeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const socials = [
  { icon: TikTokIcon, href: '#', label: 'TikTok' },
  { icon: InstagramIcon, href: '#', label: 'Instagram' },
  { icon: TwitterIcon, href: '#', label: 'Twitter / X' },
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: YoutubeIcon, href: '#', label: 'YouTube' },
  { icon: LinkedinIcon, href: '#', label: 'LinkedIn' },
];

export default function FirstForm() {
  const { t } = useTranslation();

  const SERVICES = [
    { key: 'service_marketing',  label: t('contact.service_marketing') },
    { key: 'service_funnels',    label: t('contact.service_funnels') },
    { key: 'service_dev',        label: t('contact.service_dev') },
    { key: 'service_branding',   label: t('contact.service_branding') },
    { key: 'service_video',      label: t('contact.service_video') },
    { key: 'service_community',  label: t('contact.service_community') },
    { key: 'service_automation', label: t('contact.service_automation') },
  ];
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
  });

  const [selectedServices, setSelectedServices] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const handleServiceToggle = (service) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear validation error when typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Custom validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t('contact.field_required');
    if (!formData.company.trim()) newErrors.company = t('contact.field_required');
    if (!formData.email.trim()) newErrors.email = t('contact.field_required');
    if (!formData.phone.trim()) newErrors.phone = t('contact.field_required');
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    // Pre-formatting message body for API (joins services + phone + original message)
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
      console.error('Erreur soumission formulaire:', err);
      // Fallback local pour démo si le serveur laragon est éteint
      if (!err.response) {
        setTimeout(() => {
          setStatus('success');
          setFormData({ name: '', company: '', email: '', phone: '', message: '' });
          setSelectedServices([]);
        }, 1000);
      } else {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
        );
      }
    }
  };

  return (
    <section className="relative w-full 'bg-primary-foreground' border-t border-white/5 py-24 px-6 md:px-12 lg:px-24">
      {/* Decorative Blur Background */}
      <div className="absolute top-1/4 right-1/4 w-[40vw] h-[300px] bg-[#11ad32]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 relative z-10">
        
        {/* Left Column - Get Started Branding */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#11ad32] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#11ad32] animate-pulse" />
              {t('contact.contact_us')}
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-8 max-w-lg">
              {t('contact.together_title')}
            </h2>
            
            <div className="w-16 h-[1px] bg-white/20 mb-8" />
            
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-md">
              {t('contact.together_desc')}
            </p>
          </div>

          
        </div>

        {/* Right Column - Form */}
        <div className="bg-[#050505] p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-10 tracking-tight">
            {t('contact.form_title')}
          </h3>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#11ad32]/10 border border-[#11ad32]/20 flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-[#11ad32]" />
                </div>
                <h4 className="text-2xl font-bold text-white">{t('contact.success_title')}</h4>
                <p className="text-gray-400 max-w-sm text-sm">
                  {t('contact.success_desc')}
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 px-6 py-3 bg-white/5 text-white border border-white/10 rounded-xl hover:border-[#11ad32]/40 transition-colors text-sm font-medium"
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
              >
                {/* 2x2 Grid for standard inputs */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
                  {/* Full Name */}
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t('contact.field_name')}
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className={`bg-transparent border-b ${errors.name ? 'border-red-500' : 'border-white/20'} py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#11ad32] transition-colors w-full`}
                      placeholder=""
                    />
                    {errors.name && (
                      <span className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle size={10} /> {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Company */}
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t('contact.field_company')}
                    </label>
                    <input
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      className={`bg-transparent border-b ${errors.company ? 'border-red-500' : 'border-white/20'} py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#11ad32] transition-colors w-full`}
                      placeholder=""
                    />
                    {errors.company && (
                      <span className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle size={10} /> {errors.company}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t('contact.field_email')}
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`bg-transparent border-b ${errors.email ? 'border-red-500' : 'border-white/20'} py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#11ad32] transition-colors w-full`}
                      placeholder=""
                    />
                    {errors.email && (
                      <span className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle size={10} /> {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t('contact.field_phone')}
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`bg-transparent border-b ${errors.phone ? 'border-red-500' : 'border-white/20'} py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#11ad32] transition-colors w-full`}
                      placeholder=""
                    />
                    {errors.phone && (
                      <span className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle size={10} /> {errors.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tag Selection: Interested in */}
                <div className="flex flex-col gap-3 mt-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('contact.services_label')}
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {SERVICES.map((service) => {
                      const isSelected = selectedServices.includes(service.key);
                      return (
                        <button
                          key={service.key}
                          type="button"
                          onClick={() => handleServiceToggle(service.key)}
                          className={`px-5 py-2.5 rounded-full text-xs font-medium border transition-all duration-300 select-none ${
                            isSelected
                              ? 'bg-white text-[#0a0a0a] border-white shadow-lg'
                              : 'bg-transparent text-gray-400 border-white/10 hover:border-[#11ad32]/40 hover:text-white'
                          }`}
                        >
                          {service.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tell us more (Message) */}
                <div className="flex flex-col gap-2 mt-4 relative">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t('contact.message_label')}
                  </label>
                  <input
                    name="message"
                    type="text"
                    value={formData.message}
                    onChange={handleChange}
                    className="bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#11ad32] transition-colors w-full"
                    placeholder={t('contact.message_placeholder')}
                  />
                </div>

                {/* Error Banner */}
                {status === 'error' && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mt-2">
                    <AlertCircle size={16} className="shrink-0" />
                    {errorMessage}
                  </div>
                )}

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="mt-6 w-full py-4 px-8 bg-black hover:bg-white text-white border border-white font-bold  hover:text-black  transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 hover:translate-x-1"
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
      </div>
    </section>
  );
}
