document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelectorAll('nav .nav-links');

  if (!toggle || links.length === 0) return;

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    links.forEach((nav) => nav.classList.toggle('mobile-open'));
    const expanded = this.getAttribute('aria-expanded') === 'true';
    const newState = (!expanded).toString();
    this.setAttribute('aria-expanded', newState);
    // swap material icon between menu and close for clearer mobile UX
    const icon = this.querySelector('.material-icons');
    if (icon) icon.textContent = newState === 'true' ? 'close' : 'menu';
    // class for animated styling
    this.classList.toggle('open', newState === 'true');
  });

  // Close mobile nav on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('nav')) {
      links.forEach((nav) => nav.classList.remove('mobile-open'));
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      links.forEach((nav) => nav.classList.remove('mobile-open'));
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });
});
