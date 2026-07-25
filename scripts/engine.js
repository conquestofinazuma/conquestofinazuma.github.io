/* ============================================================
   Conquest of Inazuma — Core Engine
============================================================ */

const Engine = (() => {

  const screens = {};
  let currentScreenId = null;

  // Mobile button-row state: 'A' = slots 1-5, 'B' = slots 6-10.
  // Always resets to 'A' whenever setButtons() is called.
  let buttonRow = 'A';

  const layoutMainmenu = () => document.getElementById('layout-mainmenu');
  const layoutGeneric   = () => document.getElementById('layout-generic');
  const parchmentText   = () => document.getElementById('parchment-text');
  const buttonSlots     = () => document.querySelectorAll('.action-btn');
  const rowArrow        = () => document.getElementById('row-arrow');

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
    layoutGeneric().style.display  = (def.layout === 'generic')  ? 'flex' : 'none';

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

    // any fresh call to setButtons resets the visible group back to A
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
  // Slots 1-5 belong to row A, slots 6-10 belong to row B.
  // This only visually matters on mobile (desktop shows all 10 via CSS);
  // the arrow toggles which group of 5 is displayed/interactive on mobile.
  function updateRowVisibility(){
    const slots = buttonSlots();

    slots.forEach(btn => {
      const slotNum = parseInt(btn.dataset.slot, 10);
      const belongsToA = slotNum <= 5;
      const shouldShowOnMobile = (buttonRow === 'A') ? belongsToA : !belongsToA;
      btn.classList.toggle('mobile-hidden', !shouldShowOnMobile);
    });

    // does row B have any active button? (only relevant while sitting on row A)
    const rowBHasContent = Array.from(slots).some(btn =>
      parseInt(btn.dataset.slot, 10) > 5 && btn.classList.contains('active')
    );
    const rowAHasContent = Array.from(slots).some(btn =>
      parseInt(btn.dataset.slot, 10) <= 5 && btn.classList.contains('active')
    );

    const arrow = rowArrow();
    if(!arrow) return;

    // Arrow only shows if there's a reason to flip — i.e. the *other* row has content.
    const otherRowHasContent = (buttonRow === 'A') ? rowBHasContent : rowAHasContent;
    arrow.style.display = otherRowHasContent ? 'flex' : 'none';

    // Point the arrow in a direction that makes sense for the current row.
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