// Dark/Light theme toggle
// Injects a floating button (🌙 / ☀️) top-right that toggles a "dark-theme" class on <body>.
// Preference is stored in localStorage under "theme" so the choice persists across visits.

(function () {
  // Wait until DOM is fully ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const DARK_CLASS = 'dark-theme';
    const STORAGE_KEY = 'theme';

    // Create button element
    const btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle dark mode');

    // Inner knob element for CSS animation (sun / moon)
    const knob = document.createElement('div');
    knob.className = 'knob';
    btn.appendChild(knob);

    // Make sure it is first in the document so it sits above other content
    document.body.appendChild(btn);

    // Restore saved preference
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark') {
      document.body.classList.add(DARK_CLASS);
    } else if (saved === 'light') {
      document.body.classList.remove(DARK_CLASS);
    }

    // Set initial icon
    updateIcon();

    // Click handler
    btn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle(DARK_CLASS);
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
      updateIcon();
    });

    // Helper to switch icon between moon/sun
    function updateIcon() {
      const isDark = document.body.classList.contains(DARK_CLASS);
      btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      btn.setAttribute('aria-label', btn.title);
    }
  }
})(); 