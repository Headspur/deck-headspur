// Keep the modal mounted during exit so both directions animate smoothly.
(() => {
  const menu = document.querySelector("#mobile-menu");
  const toggle = document.querySelector(".menu-toggle");
  const mobile = window.matchMedia("(max-width: 700px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let closing = false;
  let closeTimer;
  function finishClose() {
    clearTimeout(closeTimer);
    menu.classList.remove("is-open");
    menu.close();
    document.documentElement.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    closing = false;
  }
  function closeMenu() {
    if (!menu.open || closing) return;
    closing = true;
    menu.classList.remove("is-open");
    if (reducedMotion.matches) finishClose();
    else closeTimer = setTimeout(finishClose, 340);
  }
  toggle.addEventListener("click", () => {
    if (!mobile.matches || menu.open) return;
    menu.showModal();
    document.documentElement.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
    // Flush the offscreen state before transitioning into view.
    menu.getBoundingClientRect();
    menu.classList.add("is-open");
  });
  menu.querySelector(".menu-close").addEventListener("click", closeMenu);
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  menu.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeMenu();
  });
  menu.addEventListener("click", (event) => {
    const bounds = menu.getBoundingClientRect();
    if (event.target === menu && (event.clientX < bounds.left || event.clientX > bounds.right)) closeMenu();
  });
  menu.addEventListener("transitionend", (event) => {
    if (closing && event.target === menu && event.propertyName === "transform") finishClose();
  });
  mobile.addEventListener("change", () => {
    if (!mobile.matches && menu.open) finishClose();
  });
})();

// Scale the responsive circle to cover the card's farthest corner.
document.querySelectorAll("article.service, article.strategy").forEach((card) => {
  function updateFillScale() {
    const circle = getComputedStyle(card, "::after");
    const circleRadius = parseFloat(circle.width) / 2;
    const x = card.clientWidth - parseFloat(circle.right) - circleRadius;
    const y = card.matches(".strategy")
      ? card.clientHeight - parseFloat(circle.bottom) - circleRadius
      : parseFloat(circle.top) + circleRadius;
    const radius = Math.hypot(
      Math.max(x, card.clientWidth - x),
      Math.max(y, card.clientHeight - y),
    );
    card.style.setProperty("--service-fill-scale", (radius + 1) / circleRadius);
  }
  updateFillScale();
  new ResizeObserver(updateFillScale).observe(card);
});

const reports = {
  weekly: [
    "Performance report — spend, revenue, ROAS, CPC",
    "Campaign optimisation log",
    "Active AB test status update",
  ],
  monthly: [
    "Growth strategy review & budget pacing",
    "CRO sprint report with recommendations",
    "Test results & next hypothesis backlog",
  ],
  quarterly: [
    "Full-funnel performance audit",
    "Channel mix & budget planning for next quarter",
    "Pilot review & scope expansion proposal",
  ],
};
const panel = document.querySelector("#cadence-panel");
const reportDetails = {
  weekly: [
    "Review spend, revenue, return on ad spend (ROAS), and cost per click (CPC) in one performance summary.",
    "Review campaign adjustments and the optimisation activity carried out during the week.",
    "See which A/B tests are running and review their current progress.",
  ],
  monthly: [
    "Review the growth roadmap, channel priorities, budget pacing, and reallocation decisions for the coming month.",
    "Review the CRO sprint, including recommendations for the customer journey, product pages, and checkout.",
    "Share test results and prioritise the next hypotheses by revenue impact.",
  ],
  quarterly: [
    "Review full-funnel performance, key learnings, and opportunities across paid media and conversion.",
    "Plan the channel mix and budget allocation for the next quarter.",
    "Review the pilot and agree the scope for the next phase of work.",
  ],
};
function selectTab(tab) {
  document.querySelectorAll('[role="tab"]').forEach((t) => {
    t.setAttribute("aria-selected", String(t === tab));
    t.tabIndex = t === tab ? 0 : -1;
  });
  panel.setAttribute("aria-labelledby", tab.id);
  const cadence = tab.textContent.trim().toLowerCase();
  panel.replaceChildren(
    ...reports[cadence].map((text, index) => {
      const row = document.createElement("div");
      row.className = "report-row";
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "report-trigger";
      trigger.id = `report-${cadence}-${index}`;
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", `${trigger.id}-content`);
      const label = document.createElement("span");
      label.textContent = text;
      const icon = document.createElement("img");
      icon.src = "assests/images/deck-artwork/93ad7.svg";
      icon.alt = "";
      trigger.append(label, icon);
      const content = document.createElement("div");
      content.className = "report-content";
      content.id = `${trigger.id}-content`;
      content.setAttribute("aria-labelledby", trigger.id);
      content.setAttribute("role", "region");
      content.setAttribute("aria-hidden", "true");
      content.inert = true;
      const inner = document.createElement("div");
      const description = document.createElement("p");
      description.textContent = reportDetails[cadence][index];
      inner.append(description);
      content.append(inner);
      trigger.addEventListener("click", () => {
        const expanded = trigger.getAttribute("aria-expanded") !== "true";
        panel.querySelectorAll(".report-row").forEach(item => {
          const open = item === row && expanded;
          item.classList.toggle("is-open", open);
          item.querySelector("button").setAttribute("aria-expanded", String(open));
          const body = item.querySelector(".report-content");
          body.setAttribute("aria-hidden", String(!open));
          body.inert = !open;
        });
      });
      row.append(trigger, content);
      return row;
    }),
  );
}
const tabs = [...document.querySelectorAll('[role="tab"]')];
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (e) => {
    let j;
    if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") j = (i + tabs.length - 1) % tabs.length;
    if (e.key === "Home") j = 0;
    if (e.key === "End") j = tabs.length - 1;
    if (j !== undefined) {
      e.preventDefault();
      tabs[j].focus();
      selectTab(tabs[j]);
    }
  });
});
selectTab(tabs[0]);

// The campaign image and caption follow the current Deck Web design.
(() => {
  const hero = document.querySelector('.hero');
  const slider = hero.querySelector('.hero-slider');
  const art = hero.querySelector('.hero-art');
  const pause = hero.querySelector('.hero-pause');
  const status = hero.querySelector('.hero-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const slides = [
    { image: 'assests/images/deck-artwork/a9d35.png', alt: 'Celio fashion campaign featuring a model holding a jacket', logo: 'assests/images/deck-artwork/ad1e6.svg', brand: 'Celio' },
    { image: 'assests/images/deck-artwork/370df.png', alt: 'Neopalms fashion campaign featuring a model in an orange shirt', logo: 'assests/images/deck-artwork/0017c.png', brand: 'Neopalms', expanded: true },
    { image: 'assests/images/deck-artwork/74ffd.png', alt: 'KapKids campaign featuring two children in green and denim outfits', logo: 'assests/images/deck-artwork/1d89e.png', brand: 'KapKids', expanded: true },
  ];
  if (slides.length < 2) {
    slider.querySelectorAll('button').forEach(button => { button.disabled = true; });
    pause.hidden = true;
    return;
  }
  const captionLogo = slider.querySelector('.hero-caption img');
  const first = art.querySelector('.hero-photo');
  const photos = slides.map((slide, index) => {
    const photo = index ? first.cloneNode(false) : first;
    photo.src = slide.image;
    photo.alt = slide.alt;
    photo.draggable = false;
    photo.classList.toggle('is-active', index === 0);
    photo.classList.toggle('hero-photo-expanded', Boolean(slide.expanded));
    photo.setAttribute('aria-hidden', String(index !== 0));
    if (index) {
      photo.removeAttribute('fetchpriority');
      art.insertBefore(photo, art.querySelector('.graph-badge'));
    }
    return photo;
  });
  hero.setAttribute('aria-roledescription', 'carousel');
  status.textContent = 'Campaign 1 of ' + slides.length;
  const captionLogos = slides.map(slide => {
    const logo = new Image();
    logo.src = slide.logo;
    return logo;
  });
  let current = 0;
  let version = 0;
  let timer;
  let paused = reducedMotion.matches;
  let hovering = false;
  function schedule() {
    clearTimeout(timer);
    if (!paused && !hovering && !document.hidden && !hero.contains(document.activeElement)) {
      timer = setTimeout(() => move(1), 3000);
    }
  }
  function updatePause() {
    pause.textContent = paused ? 'Play' : 'Pause';
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', (paused ? 'Play' : 'Pause') + ' campaign slideshow');
    schedule();
  }
  async function move(direction, announce = false) {
    const target = (current + direction + slides.length) % slides.length;
    const request = ++version;
    try { await Promise.all([photos[target].decode(), captionLogos[target].decode()]); } catch { schedule(); return; }
    if (request !== version) return;
    current = target;
    captionLogo.src = slides[target].logo;
    captionLogo.alt = slides[target].brand;
    photos.forEach((photo, index) => {
      photo.classList.toggle('is-active', index === target);
      photo.setAttribute('aria-hidden', String(index !== target));
    });
    status.setAttribute('aria-live', announce ? 'polite' : 'off');
    status.textContent = 'Campaign ' + (target + 1) + ' of ' + slides.length;
    schedule();
  }
  slider.querySelector('.hero-prev').addEventListener('click', () => move(-1, true));
  slider.querySelector('.hero-next').addEventListener('click', () => move(1, true));
  pause.addEventListener('click', () => { paused = !paused; updatePause(); });
  hero.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  hero.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  hero.addEventListener('focusin', schedule);
  hero.addEventListener('focusout', () => setTimeout(schedule, 0));
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updatePause(); });
  hero.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1, true);
  });
  let touchStart;
  let suppressClickUntil = 0;
  hero.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  hero.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      suppressClickUntil = Date.now() + 500;
      move(dx < 0 ? 1 : -1, true);
    }
  }, { passive: true });
  hero.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  hero.addEventListener('click', event => {
    if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  updatePause();
})();

document.querySelector("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#email").value;
  window.location.href =
    "mailto:geetanjali@headspur.it?subject=" +
    encodeURIComponent("Project enquiry") +
    "&body=" +
    encodeURIComponent(
      "Hello Headspur,\n\nI would like to discuss a project.\n\nMy email: " +
        email,
    );
  document.querySelector("#form-note").textContent =
    "Continue in your email app to send your project enquiry.";
});

// Content stays visible without JavaScript or animation support. Animate only
// as it enters the viewport, without changing layout or existing transforms.
(() => {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!("IntersectionObserver" in window) || !Element.prototype.animate) return;

  const targets = document.querySelectorAll([
    ".story-top",
    ".stats > *",
    ".section-intro",
    ".service-grid > article",
    ".service-stack > article",
    ".trust",
    ".brand-grid > *",
    ".section > h2",
    ".section-subtitle",
    ".work-card",
    ".cadence-heading",
    "#cadence-panel",
    ".cadence-note",
    ".ways .wrap > h2",
    ".ways .wrap > p",
    ".ways-grid > details",
    ".gallery .project",
    ".footer-grid > *",
    ".wordmark",
  ].join(","));
  const activeAnimations = new Map();
  const observer = new IntersectionObserver((entries) => {
    const entering = entries.filter((entry) => entry.isIntersecting);
    entering.forEach(({ target }, index) => {
      observer.unobserve(target);
      if (motionPreference.matches || target.contains(document.activeElement)) return;

      const animation = target.animate([
        { opacity: 0, translate: "0 24px" },
        { opacity: 1, translate: "0 0" },
      ], {
        duration: 650,
        delay: Math.min(index % 6, 4) * 65,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "backwards",
      });
      activeAnimations.set(target, animation);
      animation.onfinish = animation.oncancel = () => activeAnimations.delete(target);
    });
  }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });

  if (!motionPreference.matches) targets.forEach((target) => observer.observe(target));
  motionPreference.addEventListener("change", () => {
    if (!motionPreference.matches) return;
    observer.disconnect();
    activeAnimations.forEach((animation) => animation.cancel());
  });
  // Keyboard navigation should never have to wait for a visual reveal.
  document.addEventListener("focusin", (event) => {
    targets.forEach((target) => {
      if (!target.contains(event.target)) return;
      observer.unobserve(target);
      activeAnimations.get(target)?.cancel();
    });
  });
})();


// The service selection populates the subject in the shared contact form.
(() => {
  const dialog = document.querySelector('#service-enquiry');
  const subject = dialog.querySelector('#enquiry-subject');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let opener;
  let closeTimer;
  let closing = false;
  function finishClose() {
    clearTimeout(closeTimer);
    dialog.close();
    document.documentElement.classList.remove('enquiry-open');
    closing = false;
    opener?.focus({ preventScroll: true });
  }
  function close() {
    if (closing || !dialog.open) return;
    closing = true;
    dialog.classList.remove('is-open');
    if (reduced.matches) finishClose();
    else closeTimer = setTimeout(finishClose, 320);
  }
  document.querySelectorAll('.service-grid article').forEach(card => {
    const service = card.querySelector('h3').textContent.trim();
    const primaryLink = card.querySelector('.service-more') || card.querySelector('a');
    card.querySelectorAll('a').forEach(link => {
      link.setAttribute('aria-haspopup', 'dialog');
      link.setAttribute('aria-controls', 'service-enquiry');
    });
    card.addEventListener('click', event => {
      const link = event.target.closest('a');
      event.preventDefault();
      opener = link || primaryLink;
      subject.value = link?.closest('li') ? link.textContent.trim() : service;
      clearTimeout(closeTimer);
      closing = false;
      dialog.showModal();
      document.documentElement.classList.add('enquiry-open');
      dialog.querySelector('#enquiry-name').focus({ preventScroll: true });
      dialog.getBoundingClientRect();
      dialog.classList.add('is-open');
    });
  });
  dialog.querySelector('.enquiry-close').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  let backdropStart = false;
  const outside = event => {
    const r = dialog.getBoundingClientRect();
    return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
  };
  dialog.addEventListener('pointerdown', event => { backdropStart = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => {
    if (backdropStart && event.target === dialog && outside(event)) close();
    backdropStart = false;
  });
  dialog.addEventListener('transitionend', event => {
    if (closing && event.target === dialog && event.propertyName === 'opacity') finishClose();
  });
})();
