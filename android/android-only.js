/* Adattamento dinamico riservato all'APK.
   Ridimensiona solo il cerchio se la scheda principale supera l'altezza
   utile. Non cambia il ritmo della respirazione né i pannelli. */
(() => {
  'use strict';
  const app = document.querySelector('.app');
  const mainCard = document.querySelector('.main-card');
  const stage = document.querySelector('.main-card > .stage');
  if (!app || !mainCard || !stage) return;

  let frame = 0;
  function fit() {
    frame = 0;
    if (window.matchMedia('(orientation: landscape) and (max-height: 570px)').matches) {
      stage.style.maxWidth = '';
      return;
    }
    // Non ridimensionare la schermata mentre è visibile la tastiera.
    if (document.activeElement && document.activeElement.matches('input, textarea, select')) return;

    stage.style.maxWidth = '';
    const style = getComputedStyle(app);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const usable = (window.visualViewport ? window.visualViewport.height : window.innerHeight) - padding - 8;
    const stageHeight = stage.getBoundingClientRect().height;
    const cardHeight = mainCard.getBoundingClientRect().height;
    const otherHeight = Math.max(0, cardHeight - stageHeight);
    // Mantieni il cerchio il più grande possibile, ma senza far scorrere
    // la schermata principale su dispositivi di dimensioni standard.
    const fitted = Math.max(118, Math.min(470, stageHeight, usable - otherHeight));
    if (fitted < stageHeight - 1) stage.style.maxWidth = Math.floor(fitted) + 'px';
    if (app.scrollTop > 0 && arePanelsClosed()) app.scrollTop = 0;
  }

  function arePanelsClosed() {
    return ['settingsPanel','recordCard','presetsPanel']
      .every(id => document.getElementById(id)?.classList.contains('hidden'));
  }

  function schedule() {
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fit);
  }

  window.addEventListener('resize', schedule, {passive:true});
  window.addEventListener('orientationchange', schedule, {passive:true});
  window.visualViewport?.addEventListener('resize', schedule, {passive:true});
  window.addEventListener('load', schedule);
  ['settingsPanel', 'recordCard', 'presetsPanel'].forEach(id => {
    const panel = document.getElementById(id);
    if (panel) {
      new MutationObserver(() => {
        if (arePanelsClosed()) app.scrollTop = 0;
        schedule();
      }).observe(panel, {attributes:true, attributeFilter:['class']});
    }
  });
  schedule();
})();
