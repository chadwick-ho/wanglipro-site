/* Progressive enhancement of editable core blocks; no library or remote requests. */
(() => {
  'use strict';
  document.querySelectorAll('.wl-home-carousel').forEach(root => {
    const track = root.querySelector('.wl-carousel-track');
    if (!track || root.dataset.carouselReady) return;
    const slides = [...track.children].filter(el => el.classList.contains('wl-carousel-slide'));
    if (slides.length < 2) return;
    root.dataset.carouselReady = 'true';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-roledescription', 'carrousel');
    root.setAttribute('aria-label', 'Préparer votre achat de mobilier scolaire');
    root.querySelectorAll('.wl-slide-documents').forEach(gallery => {
      gallery.tabIndex = 0;
      gallery.setAttribute('role', 'region');
      gallery.setAttribute('aria-label', `${gallery.querySelectorAll('.wl-slide-document').length} documents — faites défiler les copies`);
      const documents = [...gallery.querySelectorAll('.wl-slide-document')];
      const nav = document.createElement('div'); nav.className = 'wl-document-nav';
      const prev = document.createElement('button'); const next = document.createElement('button');
      const count = document.createElement('span'); count.className = 'wl-document-count';
      prev.type = next.type = 'button'; prev.textContent = '←'; next.textContent = '→';
      prev.setAttribute('aria-label', 'Certificat précédent'); next.setAttribute('aria-label', 'Certificat suivant');
      const update = () => { const i = Math.max(0, Math.min(documents.length - 1, Math.round(gallery.scrollLeft / gallery.clientWidth))); count.textContent = `${i + 1} / ${documents.length}`; prev.disabled = i === 0; next.disabled = i === documents.length - 1; };
      const move = (direction) => { gallery.scrollBy({left: direction * gallery.clientWidth, behavior: 'smooth'}); };
      prev.addEventListener('click', () => move(-1)); next.addEventListener('click', () => move(1));
      gallery.addEventListener('scroll', update, {passive:true});
      nav.append(prev, count, next); gallery.after(nav); update();
    });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0, paused = reducedMotion.matches, timer;
    const controls = document.createElement('div');
    controls.className = 'wl-carousel-controls';
    controls.setAttribute('aria-label', 'Commandes du carrousel');
    const tabs = document.createElement('div');
    tabs.className = 'wl-carousel-selectors';
    const labels = ['Modèles & quantités', 'Certificats & dossier', 'Emballage & livraison'];
    const button = (text, label, className) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = text;
      b.setAttribute('aria-label', label); b.className = className; return b;
    };
    const selectors = slides.map((slide, index) => {
      slide.setAttribute('role', 'group'); slide.setAttribute('aria-roledescription', 'diapositive');
      slide.setAttribute('aria-label', `${index + 1} sur ${slides.length}`);
      const b = button(`${String(index + 1).padStart(2, '0')}  ${labels[index] || 'Projet'}`, `Afficher : ${labels[index] || index + 1}`, 'wl-carousel-selector');
      b.setAttribute('aria-controls', slide.id); b.addEventListener('click', () => show(index, true));
      tabs.append(b); return b;
    });
    const transport = document.createElement('div'); transport.className = 'wl-carousel-transport';
    const previous = button('←', 'Diapositive précédente', 'wl-carousel-arrow');
    const next = button('→', 'Diapositive suivante', 'wl-carousel-arrow');
    const play = button('', '', 'wl-carousel-play');
    const status = document.createElement('span'); status.className = 'wl-carousel-status';
    status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true');
    const renderPlay = () => {
      play.textContent = paused ? '▶' : 'Ⅱ';
      play.setAttribute('aria-label', paused ? 'Reprendre le défilement' : 'Mettre le défilement en pause');
      play.setAttribute('aria-pressed', paused ? 'true' : 'false');
    };
    function schedule() {
      window.clearTimeout(timer);
      if (!paused && !document.hidden && !root.matches(':hover') && (document.activeElement === play || !root.contains(document.activeElement))) {
        timer = window.setTimeout(() => { show(current + 1); }, 8000);
      }
    }
    function pause() { paused = true; window.clearTimeout(timer); renderPlay(); }
    function show(index, user = false) {
      current = (index + slides.length) % slides.length;
      slides[current].hidden = false;
      slides.forEach((slide, i) => { if (i !== current) slide.hidden = true; });
      selectors.forEach((b, i) => b.setAttribute('aria-pressed', String(i === current)));
      if (user) { pause(); status.textContent = `${current + 1} sur ${slides.length} — ${labels[current]}`; }
      schedule();
    }
    previous.addEventListener('click', () => show(current - 1, true));
    next.addEventListener('click', () => show(current + 1, true));
    play.addEventListener('click', () => { paused = !paused; renderPlay(); schedule(); });
    root.addEventListener('mouseenter', () => window.clearTimeout(timer));
    root.addEventListener('mouseleave', schedule);
    root.addEventListener('focusin', event => { if (event.target !== play) pause(); });
    root.addEventListener('focusout', schedule);
    root.addEventListener('touchstart', pause, { passive: true });
    root.addEventListener('keydown', event => {
      if (event.target.closest('.wl-slide-documents') || event.ctrlKey || event.metaKey || event.altKey || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
      event.preventDefault();
      show(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowLeft' ? -1 : 1), true);
    });
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', event => { if (event.matches) pause(); });
    transport.append(previous, next, play); controls.append(tabs, transport, status);
    track.after(controls); root.classList.add('wl-carousel-enhanced'); renderPlay(); show(0);
  });
})();
