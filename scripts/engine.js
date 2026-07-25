/* ============================================================
   Conquest of Inazuma — Core Engine
============================================================ */

const Engine = (() => {

  const screens = {};
  let currentScreenId = null;

  let buttonRow = 'A';

  const layoutMainmenu = () => document.getElementById('layout-mainmenu');
  const layoutContent  = () => document.getElementById('layout-content'); // renamed from layoutGeneric
  const parchmentText  = () => document.getElementById('parchment-text');
  const buttonSlots    = () => document.querySelectorAll('.action-btn');
  const rowArrow       = () => document.getElementById('row-arrow');
  const gameframe      = () => document.getElementById('gameframe');

  function register(id, definition){
    screens[id] = definition;
  }

  function show(id, params){
    const def = screens[id];
    if(!def){
      console.error(`[Engine] No screen registered with id "${id}"`);
      return;
    }

    currentScreenId = id;

    layoutMainmenu().style.display = (def.layout === 'mainmenu') ? 'flex' : 'none';
    layoutContent().style.display  = (def.layout === 'generic')  ? 'flex' : 'none';

    // Party/minimap/compass frame: shown unless a screen explicitly opts out
    // (main menu, intro). Default to true so future screens don't need to
    // remember to turn it on.
    const showFrame = def.showFrame !== false;
    gameframe().classList.toggle('frame-hidden', !showFrame);

    clearButtons();

    const ctx = { show, setButtons, setText };

    if(typeof def.onEnter === 'function'){
      def.onEnter(ctx, params);
    }
  }

  function setText(paragraphs){
    const container = parchmentText();
    container.innerHTML = '';
    paragraphs.forEach(p => {
      const el = document.createElement('p');
      el.textContent = p;
      container.appendChild(el);
    });
    container.scrollTop = 0;
  }

  /* ---------- Button deck ---------- */
  function setButtons(buttonDefs){
    clearButtons();
    buttonDefs.forEach(def => {
      const slotEl = document.querySelector(`.action-btn[data-slot="${def.slot}"]`);
      if(!slotEl) return;
      slotEl.classList.remove('empty');
      slotEl.classList.add('active');
      slotEl.querySelector('.label').textContent = def.label;
      slotEl._action = def.action;
    });

    buttonRow = 'A';
    updateRowVisibility();
  }

  function clearButtons(){
    buttonSlots().forEach(btn => {
      btn.classList.remove('active');
      btn.classList.add('empty');
      btn.querySelector('.label').textContent = '';
      btn._action = null;
    });
    buttonRow = 'A';
    updateRowVisibility();
  }

  function runButton(btn){
    if(btn.classList.contains('active') && typeof btn._action === 'function'){
      pulse(btn);
      btn._action();
    }
  }

  function pulse(btn){
    btn.style.transform = 'scale(0.97)';
    setTimeout(() => btn.style.transform = '', 120);
  }

  /* ---------- Mobile button-row visibility ---------- */
  function updateRowVisibility(){
    const slots = buttonSlots();

    slots.forEach(btn => {
      const slotNum = parseInt(btn.dataset.slot, 10);
      const belongsToA = slotNum <= 5;
      const shouldShowOnMobile = (buttonRow === 'A') ? belongsToA : !belongsToA;
      btn.classList.toggle('mobile-hidden', !shouldShowOnMobile);
    });

    const rowBHasContent = Array.from(slots).some(btn =>
      parseInt(btn.dataset.slot, 10) > 5 && btn.classList.contains('active')
    );
    const rowAHasContent = Array.from(slots).some(btn =>
      parseInt(btn.dataset.slot, 10) <= 5 && btn.classList.contains('active')
    );

    const arrow = rowArrow();
    if(!arrow) return;

    const otherRowHasContent = (buttonRow === 'A') ? rowBHasContent : rowAHasContent;
    arrow.classList.toggle('has-content', otherRowHasContent);

    arrow.textContent = (buttonRow === 'A') ? '⌄' : '⌃';
    arrow.setAttribute('aria-label', buttonRow === 'A' ? 'Show more options' : 'Show first options');
  }

  function toggleButtonRow(){
    buttonRow = (buttonRow === 'A') ? 'B' : 'A';
    updateRowVisibility();
  }

  /* ---------- Input ---------- */
  function bindInput(){
    buttonSlots().forEach(btn => btn.addEventListener('click', () => runButton(btn)));

    const keyOrder = ['1','2','3','4','5','6','7','8','9','0'];
    const slots = document.querySelectorAll('.action-btn');

    document.addEventListener('keydown', (e) => {
      const idx = keyOrder.indexOf(e.key);
      if(idx === -1) return;
      const slot = slots[idx];
      if(slot) runButton(slot);
    });

    const arrow = rowArrow();
    if(arrow){
      arrow.addEventListener('click', toggleButtonRow);
    }
  }

  /* ---------- Background rotation ---------- */
  function bindBackgroundRotation(images, intervalMs){
    const layerA = document.getElementById('bgLayerA');
    const layerB = document.getElementById('bgLayerB');
    let index = 0;
    let showingA = true;

    images.forEach(src => { const img = new Image(); img.src = src; });

    layerA.style.backgroundImage = `url('${images[0]}')`;
    layerA.classList.add('visible');

    setInterval(() => {
      index = (index + 1) % images.length;
      const incoming = showingA ? layerB : layerA;
      const outgoing = showingA ? layerA : layerB;
      incoming.style.backgroundImage = `url('${images[index]}')`;
      incoming.classList.add('visible');
      outgoing.classList.remove('visible');
      showingA = !showingA;
    }, intervalMs);
  }

  /* ---------- Ambient lightning flash ---------- */
  function bindAmbientFlash(){
    function scheduleFlash(){
      const delay = 9000 + Math.random() * 14000;
      setTimeout(() => {
        const flash = document.getElementById('flash');
        flash.classList.remove('strike');
        void flash.offsetWidth;
        flash.classList.add('strike');
        scheduleFlash();
      }, delay);
    }
    scheduleFlash();
  }

  function init(){
    bindInput();
    bindAmbientFlash();
    bindBackgroundRotation(
      ['assets/title/background.webp','assets/title/background2.webp','assets/title/background3.webp','assets/title/background4.webp'],
      10000
    );
    updateRowVisibility();
    show('mainmenu');
  }

  return { register, show, init };
})();