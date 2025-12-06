// Initialize theme immediately
(function initTheme() {
  const saved = localStorage.getItem('simplex-theme') || 'dark';
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.add('light-mode');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.remove('light-mode');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // Create an accessible theme toggle (sun/moon) and insert into nav so it's available on all pages
  try {
    const nav = document.querySelector('nav');
    if (nav) {
      // Avoid duplicate insertion
      if (!document.getElementById('theme-toggle')) {
        const btn = document.createElement('button');
        btn.id = 'theme-toggle';
        btn.className = 'theme-toggle-btn';
        btn.type = 'button';
        btn.setAttribute('aria-pressed', document.body.classList.contains('light-mode') ? 'true' : 'false');
        btn.setAttribute('aria-label', 'Toggle theme (dark / light)');
        btn.title = 'Toggle Dark / Light Mode';

        // Create animated switch with moon and sun
        btn.innerHTML = `
          <div class="theme-switch">
            <div class="theme-icons">
              <svg class="theme-icon moon-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <svg class="theme-icon sun-icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </div>
            <div class="theme-slider"></div>
          </div>`;

        // Insert at end of nav (visible near nav links)
        nav.appendChild(btn);

        // Click handler for theme toggle
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const isLight = document.body.classList.toggle('light-mode');
          document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
          localStorage.setItem('simplex-theme', isLight ? 'light' : 'dark');
          btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
          
          console.log('[Theme Toggle] Switched to:', isLight ? 'light' : 'dark');
        });
        
        console.log('[Theme Toggle] Button created and attached to nav');
      }
    }
  } catch (e) {
    console.error('[Theme Toggle] Error:', e);
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });

  // helper so we can reuse the logic and observe newly added elements
  const observeFadeUp = (el) => {
    try {
      if (el instanceof Element) observer.observe(el);
    } catch (e) {
      // swallow — defensive in older browsers
    }
  };

  // observe initial elements present at load
  document.querySelectorAll('.fade-up').forEach(observeFadeUp);

  // Watch for dynamically added elements with .fade-up
  // This ensures content added later (e.g., solver steps) get observed
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const element = /** @type {Element} */ (node);
        if (element.classList.contains('fade-up')) observeFadeUp(element);
        // also check descendants
        element.querySelectorAll && element.querySelectorAll('.fade-up').forEach(observeFadeUp);
      }
    }
  });

  mo.observe(document.body, { childList: true, subtree: true });
});
