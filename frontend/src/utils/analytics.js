const push = (event) => {
  if (window.dataLayer) window.dataLayer.push(event);
  if (typeof window.gtag === 'function') {
    const { event: name, ...params } = event;
    window.gtag('event', name, params);
  }
};

const fbq = (...args) => {
  if (typeof window.fbq === 'function') window.fbq(...args);
};

export const trackFormSubmit = (formName, services = '') => {
  push({ event: 'form_submit', form_name: formName, services_selected: services || 'none' });
  fbq('track', 'Lead', { content_name: formName, content_category: services || 'none' });
};

export const trackFormStart = (formName) => {
  push({ event: 'form_start', form_name: formName });
  fbq('track', 'InitiateCheckout', { content_name: formName });
};

export const trackCTAClick = (ctaLabel, location) => {
  push({ event: 'cta_click', cta_label: ctaLabel, cta_location: location });
};

export const trackServiceSelect = (service, formName) => {
  push({ event: 'service_select', service_name: service, form_name: formName });
};

export const trackPageView = (pageName) => {
  fbq('track', 'ViewContent', { content_name: pageName, content_type: 'page' });
};
