/* ============================================================
   Conquest of Inazuma — Compass Widget
   Static DOM in the right sidebar. Unlike the button-deck this
   element is never rebuilt — explore.js just calls Compass.render()
   with the four cardinal directions and we toggle classes / swap
   click handlers on the same 4 nodes.
============================================================ */

const Compass = (() => {

  function arrowEls() {
    return document.querySelectorAll('.compass-arrow');
  }

  // directions: [{ key: 'north'|'south'|'east'|'west', enabled: bool, onSelect: fn }]
  function render(directions) {
    const byKey = {};
    directions.forEach(d => { byKey[d.key] = d; });

    arrowEls().forEach(el => {
      const d = byKey[el.dataset.dir];
      const enabled = !!(d && d.enabled);
      el.classList.toggle('enabled', enabled);
      el.classList.toggle('disabled', !enabled);
      el._action = enabled ? d.onSelect : null;
    });
  }

  function clear() {
    arrowEls().forEach(el => {
      el.classList.remove('enabled');
      el.classList.add('disabled');
      el._action = null;
    });
  }

  function run(el) {
    if (el.classList.contains('enabled') && typeof el._action === 'function') {
      el._action();
    }
  }

  function bindInput() {
    arrowEls().forEach(el => el.addEventListener('click', () => run(el)));

    // Arrow keys mirror the compass — nice to have since this is
    // replacing what used to be numbered movement buttons.
    const keyMap = { ArrowUp: 'north', ArrowDown: 'south', ArrowLeft: 'west', ArrowRight: 'east' };
    document.addEventListener('keydown', (e) => {
      const dir = keyMap[e.key];
      if (!dir) return;
      const el = document.querySelector(`.compass-arrow[data-dir="${dir}"]`);
      if (el) run(el);
    });
  }

  clear();       // fully greyed until a screen renders real directions
  bindInput();

  return { render, clear };
})();