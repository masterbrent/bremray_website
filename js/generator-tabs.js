(() => {
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const container = document.querySelector('.tab-container');
  if (!tabs.length || !container) return;

  function selectTab(selected, moveFocus = false) {
    tabs.forEach(tab => {
      const active = tab === selected;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
    if (moveFocus) selected.focus({preventScroll: true});
  }

  document.querySelectorAll('[data-generator-target]').forEach(control => {
    control.addEventListener('click', () => {
      const selected = tabs.find(tab => tab.getAttribute('data-generator-target') === control.getAttribute('data-generator-target'));
      if (!selected) return;
      const fromDetails = control.getAttribute('role') !== 'tab';
      selectTab(selected, fromDetails);
      if (fromDetails) {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        container.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'});
      }
    });
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(tabs[next], true);
    });
  });

  selectTab(tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
})();
