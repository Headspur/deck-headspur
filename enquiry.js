// Mailchimp uses /post-json with a JSONP callback for cross-origin embeds.
(() => {
  const form = document.querySelector('#service-enquiry-form');
  const status = document.querySelector('#enquiry-status');
  const button = form.querySelector('[type="submit"]');
  const fields = [...form.querySelectorAll('input, textarea')];
  let pending = false;
  let sequence = 0;
  form.noValidate = true;

  function show(message, state) {
    status.textContent = message;
    status.dataset.state = state;
    status.hidden = false;
  }

  function plainText(message) {
    const parsed = new DOMParser().parseFromString(String(message || ''), 'text/html');
    return (parsed.body.textContent || '').replace(/^\d+\s*-\s*/, '').trim();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (pending) return;
    const invalid = fields.find(field => !field.validity.valid);
    fields.forEach(field => field.removeAttribute('aria-invalid'));
    if (invalid) {
      invalid.setAttribute('aria-invalid', 'true');
      show(invalid.validity.valueMissing ? 'Please enter your email address.' : 'Please enter a valid email address.', 'error');
      invalid.focus();
      return;
    }

    const url = new URL(form.action);
    url.pathname = url.pathname.replace(/\/post$/, '/post-json');
    new FormData(form).forEach((value, name) => url.searchParams.set(name, value));
    url.searchParams.set('subscribe', 'Subscribe');
    const callback = 'headspurEnquiry_' + Date.now() + '_' + (++sequence);
    url.searchParams.set('c', callback);
    const script = document.createElement('script');
    let settled = false;
    let timeout;
    pending = true;
    button.disabled = true;
    fields.forEach(field => { field.readOnly = true; });
    form.setAttribute('aria-busy', 'true');
    show('Sending your enquiry…', 'pending');

    function finish(message, state) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      script.remove();
      // A late response after a timeout must not replace the current message.
      window[callback] = () => {};
      setTimeout(() => { delete window[callback]; }, 60000);
      pending = false;
      button.disabled = false;
      fields.forEach(field => { field.readOnly = false; });
      form.removeAttribute('aria-busy');
      show(message, state);
    }

    window[callback] = response => {
      if (response?.result === 'success') {
        const detail = plainText(response.msg);
        finish('Thank you! ' + (detail || 'Your submission was received.'), 'success');
      } else {
        finish(plainText(response?.msg) || 'We couldn’t submit your enquiry. Please try again.', 'error');
      }
    };
    script.onerror = () => finish('Unable to connect. Please check your connection and try again.', 'error');
    timeout = setTimeout(() => finish('We couldn’t confirm your submission. Please try again shortly.', 'error'), 20000);
    script.src = url.href;
    document.head.append(script);
  });

  form.addEventListener('input', () => {
    if (!pending) {
      status.hidden = true;
      fields.forEach(field => field.removeAttribute('aria-invalid'));
    }
  });
})();
