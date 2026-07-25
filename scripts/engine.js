/* ============================================================
   Conquest of Inazuma — Core Engine
   Handles: screen switching, the persistent button deck,
   keyboard input, and background crossfade rotation.
   Screen content files (screens/-/-.js) register themselves
   into Engine.screens and never touch layout DOM directly.
============================================================ */

const Engine = (() => {

  const screens = {}; // registry: id -> screen definition object
  let currentScreenId = null;

  const layoutMainmenu = () => document.getElementById('layout-mainmenu');
  const layoutGeneric   = () => document.getElementById('layout-generic');
  const parchmentText   = () => document.getElementById('parchment-text');
  const buttonSlots     = () => document.querySelectorAll('.action-btn');

  /* ---------- Screen registration ---------- */
  // Screen definition shape:
  // {
  //   layout: 'mainmenu' | 'generic',
  //   onEnter(ctx): called every time this screen is shown
  // }
  function register(id, definition){
    screens[id] = definition;
  }

  /* ---------- Screen switching ---------- */
  function show(id, params){
    const def = screens[id];
    if(!def){
      console.error(`[Engine] No screen registered with id "${id}"`);
      return;
    }

    currentScreenId = id;

    // toggle which layout div is visible
    layoutMainmenu().style.display = (def.layout === 'mainmenu') ? 'flex' : 'none';
    layoutGeneric().style.display  = (def.layout === 'generic')  ? 'flex' : 'none';

    // clear button deck before the screen defines its own buttons
    clearButtons();

    // context object passed into screen callbacks, so screens can
    // call back into the engine without depending on globals directly
    const ctx = {
      show,
      setButtons,
      setText
    };

    if(typeof def.onEnter === 'function'){
      def.onEnter(ctx, params);
    }
  }

  /* ---------- Generic layout helpers ---------- */
  function setText(paragraphs){
    const container = parchmentText();
    container.innerHTML = '';
    paragraphs.forEach(p => {
      const el = document.createElement('p');
      el.textContent = p;
      container.appendChild(el);
    });
    container.scrollTop = 0; // reset scroll position on new page
  }

  /* ---------- Button deck ---------- */
  // buttonDefs: array of { slot: 1-10, label: string, action: fn }
  function setButtons(buttonDefs){
    clearButtons();
    buttonDefs.forEach(def => {
      const slotEl = document.querySelector(`.action-btn[data-slot="${def.slot}"]`);
      if(!slotEl) return;
      slotEl.classList.remove('empty');
      slotEl.classList.add('active');
      slotEl.querySelector('.label').textContent = def.label;
      slotEl.dataset.hasAction = 'true';
      slotEl._action = def.action; // stash directly on the element
    });
  }

  function clearButtons(){
    buttonSlots().forEach(btn => {
      btn.classList.remove('active');
      btn.classList.add('empty');
      btn.querySelector('.label').textContent = '';
      delete btn.dataset.hasAction;
      btn._action = null;
    });
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

  /* ---------- Input ---------- */
  function bindInput(){
    buttonSlots().forEach(btn => btn.addEventListener('click', () => runButton(btn)));

    const keyOrder = ['1','2','3','4','5','6','7','8','9','0'];
    const slots = document.querySelectorAll('.action-btn'); // in DOM order, slot 1-10

    document.addEventListener('keydown', (e) => {
      const idx = keyOrder.indexOf(e.key);
      if(idx === -1) return;
      const slot = slots[idx];
      if(slot) runButton(slot);
    });
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

  /* ---------- Boot ---------- */
  function init(){
    bindInput();
    bindAmbientFlash();
    bindBackgroundRotation(
      ['assets/title/background.webp','assets/title/background2.webp','assets/title/background3.webp','assets/title/background4.webp'],
      10000
    );
    show('mainmenu');
  }

  return { register, show, init };
})();