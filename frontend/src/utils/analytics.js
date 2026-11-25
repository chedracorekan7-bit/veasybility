const push = (event) => {
  if (window.dataLayer) window.dataLayer.push(event);
  if (typeof window.gtag === 'function') {
    const { event: name, ...params } = event;
    window.gtag('event', name, params);
  }
};

export const trackFormSubmit = (formName, services = '') => {
  push({
    event: 'form_submit',
    form_name: formName,
    services_selected: services || 'none',
  });
};

export const trackFormStart = (formName) => {
  push({ event: 'form_start', form_name: formName });
};

export const trackCTAClick = (ctaLabel, location) => {
  push({ event: 'cta_click', cta_label: ctaLabel, cta_location: location });
};

export const trackServiceSelect = (service, formName) => {
  push({ event: 'service_select', service_name: service, form_name: formName });
};
