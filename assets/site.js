(function () {
  var cfg = window.RV_CONFIG || {};

  // Mobile nav toggle
  var btn = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (btn && links) {
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Fill settings from assets/config.js
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  each('[data-rv="email"]', function (el) {
    if (!cfg.email) return;
    var a = document.createElement('a');
    a.href = 'mailto:' + cfg.email;
    a.textContent = cfg.email;
    el.replaceWith(a);
  });
  each('[data-rv="linkedin"]', function (el) {
    if (!cfg.linkedin) return;
    var a = document.createElement('a');
    a.href = cfg.linkedin; a.rel = 'noopener'; a.target = '_blank';
    a.textContent = 'LinkedIn';
    el.replaceWith(a);
  });
  each('[data-rv="schedule-btn"]', function (el) {
    if (cfg.scheduleUrl) {
      el.href = cfg.scheduleUrl; el.target = '_blank'; el.rel = 'noopener'; el.hidden = false;
    } else if (cfg.email) {
      el.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent('30-minute conversation request');
      el.textContent = 'Email me to schedule';
      el.hidden = false;
    }
  });
  each('[data-rv="schedule-ph"]', function (el) { if (cfg.scheduleUrl || cfg.email) el.hidden = true; });

  // Contact form
  var form = document.getElementById('contact-form');
  if (!form) return;
  if (cfg.formEndpoint) form.setAttribute('data-endpoint', cfg.formEndpoint);
  var msg = document.getElementById('form-msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ep = form.getAttribute('data-endpoint') || '';
    if (form.website && form.website.value) return; // honeypot
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!ep) {
      if (!cfg.email) { msg.textContent = 'This form is not connected yet.'; return; }
      var f = form.elements;
      var body = 'Name: ' + f.name.value + '\nWork email: ' + f.email.value + '\nOrganization: ' + f.organization.value +
        '\nRole: ' + f.role.value + '\nIndustry: ' + f.industry.value + '\nWhat is prompting this: ' + f.prompt.value + '\n\n' + f.message.value;
      window.location.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent('Inquiry from ' + f.name.value + ', ' + f.organization.value) + '&body=' + encodeURIComponent(body);
      msg.textContent = 'Your email app should open with your note ready to send. If it doesn’t, please email ' + cfg.email + ' directly.';
      return;
    }
    msg.textContent = 'Sending…';
    fetch(ep, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('bad status');
        form.reset();
        msg.textContent = 'Thank you. I’ll reply within one business day.';
      })
      .catch(function () {
        msg.textContent = 'Something went wrong. Please try again' + (cfg.email ? ' or email ' + cfg.email + ' directly.' : '.');
      });
  });
})();
