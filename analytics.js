// ─────────────────────────────────────────────────────────────
// 7EMPLE — PostHog custom event tracking
// Events: cta_clicked, form_submitted, scroll_depth,
//         outbound_link_clicked, bounce
// ─────────────────────────────────────────────────────────────
(function () {
  const page = window.location.pathname;

  // Helper: nearest section/landmark label for a given element
  function sectionOf(el) {
    const landmark = el.closest('section, nav, footer, header, [id]');
    if (!landmark) return 'unknown';
    return landmark.id || landmark.className.split(' ')[0] || landmark.tagName.toLowerCase();
  }

  // ─── 1. CTA / BUTTON CLICKS ────────────────────────────────
  // Fires for <a>, <button>, [role="button"] — skips outbound (handled below)
  document.addEventListener('click', function (e) {
    const el = e.target.closest('a, button, [role="button"]');
    if (!el) return;

    const href = el.getAttribute('href') || '';
    const isOutbound = (href.startsWith('http') || href.startsWith('//')) &&
                       !href.includes('7emple.com');
    if (isOutbound) return; // handled by outbound tracker

    posthog.capture('cta_clicked', {
      button_text:  el.textContent.trim().slice(0, 120),
      element_type: el.tagName.toLowerCase(),
      href:         href || null,
      section:      sectionOf(el),
      page:         page
    });
  });

  // ─── 2. FORM SUBMISSIONS ───────────────────────────────────
  document.addEventListener('submit', function (e) {
    const form = e.target;
    posthog.capture('form_submitted', {
      form_name:   form.id || form.getAttribute('name') || form.className || 'unnamed',
      field_count: form.querySelectorAll('input, textarea, select').length,
      page:        page
    });
  });

  // ─── 3. SCROLL DEPTH ──────────────────────────────────────
  // Fires once each at 25 / 50 / 75 / 100 %
  const MILESTONES = [25, 50, 75, 100];
  const fired = new Set();

  function onScroll() {
    const scrolled = window.scrollY + window.innerHeight;
    const total    = document.documentElement.scrollHeight;
    const pct      = (scrolled / total) * 100;

    for (const m of MILESTONES) {
      if (pct >= m && !fired.has(m)) {
        fired.add(m);
        posthog.capture('scroll_depth', { depth: m, page: page });
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ─── 4. OUTBOUND LINK CLICKS ──────────────────────────────
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if ((!href.startsWith('http') && !href.startsWith('//')) ||
         href.includes('7emple.com')) return;

    posthog.capture('outbound_link_clicked', {
      destination_url: href,
      link_text:       link.textContent.trim().slice(0, 120),
      page:            page
    });
  });

  // ─── 5. BOUNCE (exit within 10 seconds) ───────────────────
  const enterTime = Date.now();
  let bounceFired = false;

  function checkBounce() {
    if (bounceFired) return;
    const seconds = Math.round((Date.now() - enterTime) / 1000);
    if (seconds < 10) {
      bounceFired = true;
      posthog.capture('bounce', {
        time_on_page_seconds: seconds,
        page: page
      });
    }
  }

  // visibilitychange is more reliable on mobile; beforeunload covers desktop
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') checkBounce();
  });
  window.addEventListener('beforeunload', checkBounce);
})();
