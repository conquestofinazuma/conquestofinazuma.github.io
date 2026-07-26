const Minimap = (() => {

  const CELL = 40;
  const GAP = 10;
  const STEP = CELL + GAP;

  const MIN_WINDOW = 3;
  const MAX_WINDOW = 9;
  let windowCells = 5;      // was a const, now the current zoom level
  let lastMapId = null;     // so zoom buttons know what to re-render

  function container() { return document.getElementById('minimap-render'); }

  function parseKey(key) {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  }

  const px = (x) => x * STEP;
  const py = (y) => y * STEP;

  function edgeLocked(map, keyA, dirAtoB, keyB, dirBtoA) {
    const blockedBy = (o) => o && o.locked && !GameState.hasFlag(o.requiresFlag);
    const oA = (map.overrides[keyA] || {})[dirAtoB];
    const oB = (map.overrides[keyB] || {})[dirBtoA];
    return blockedBy(oA) || blockedBy(oB);
  }

  function poiGlyph(poi) {
    if (poi === 'shop') return '⛁';
    if (poi === 'event') return '!';
    if (poi === 'combat') return '⚔';
    return '';
  }

  function render(mapId) {
    lastMapId = mapId; // remember so zoomIn/zoomOut can re-render without a caller

    const map = MapRegistry.get(mapId);
    const el = container();
    if (!map || !el) return;

    const currentRoomId = GameState.getPosition().roomId;
    const keys = Object.keys(map.rooms);

    const currentKey = keys.find(k => map.rooms[k] === currentRoomId);
    const centerCoord = currentKey ? parseKey(currentKey) : { x: 0, y: 0 };

    const windowSize = windowCells * STEP; // was WINDOW_CELLS, now the mutable value
    const viewX = px(centerCoord.x) + CELL / 2 - windowSize / 2;
    const viewY = py(centerCoord.y) + CELL / 2 - windowSize / 2;

    let edgesSvg = '';
    let nodesSvg = '';

    keys.forEach(key => {
      const { x, y } = parseKey(key);
      const roomId = map.rooms[key];
      const room = RoomRegistry.get(roomId);

      const eastKey = `${x + 1},${y}`;
      if (map.rooms[eastKey]) {
        const locked = edgeLocked(map, key, 'east', eastKey, 'west');
        const y1 = py(y) + CELL / 2;
        edgesSvg += `<line x1="${px(x) + CELL}" y1="${y1}" x2="${px(x + 1)}" y2="${y1}" class="mm-edge${locked ? ' mm-edge-locked' : ''}"/>`;
      }
      const southKey = `${x},${y + 1}`;
      if (map.rooms[southKey]) {
        const locked = edgeLocked(map, key, 'south', southKey, 'north');
        const x1 = px(x) + CELL / 2;
        edgesSvg += `<line x1="${x1}" y1="${py(y) + CELL}" x2="${x1}" y2="${py(y + 1)}" class="mm-edge${locked ? ' mm-edge-locked' : ''}"/>`;
      }

      let stateClass;
      if (roomId === currentRoomId) {
        stateClass = 'mm-current';
      } else {
        const neighbors = [
          ['north', x, y - 1, 'south'],
          ['south', x, y + 1, 'north'],
          ['east',  x + 1, y, 'west'],
          ['west',  x - 1, y, 'east']
        ];
        const hasOpenEdge = neighbors.some(([dirOut, nx, ny, dirBack]) => {
          const nKey = `${nx},${ny}`;
          return map.rooms[nKey] && !edgeLocked(map, key, dirOut, nKey, dirBack);
        });
        stateClass = !hasOpenEdge
          ? 'mm-locked'
          : (GameState.hasVisited(roomId) ? 'mm-visited' : 'mm-fog');
      }

      const glyph = poiGlyph(room && room.poi);
      const rx = px(x), ry = py(y);

      nodesSvg += `
        <g class="mm-node ${stateClass}">
          <rect x="${rx}" y="${ry}" width="${CELL}" height="${CELL}" rx="4"/>
          ${glyph ? `<text x="${rx + CELL/2}" y="${ry + CELL/2}" class="mm-glyph" text-anchor="middle" dominant-baseline="central">${glyph}</text>` : ''}
        </g>`;
    });

    el.innerHTML = `<svg viewBox="${viewX} ${viewY} ${windowSize} ${windowSize}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${edgesSvg}${nodesSvg}</svg>`;
  }

  // Zoom out = SEE MORE rooms = bigger window. Zoom in = fewer rooms, closer view.
  // Step by 2 (not 1) to keep windowCells odd, so the player's room stays
  // exactly centered rather than snapping half a cell off-center.
  function zoomIn() {
    windowCells = Math.max(MIN_WINDOW, windowCells - 2);
    if (lastMapId) render(lastMapId);
  }

  function zoomOut() {
    windowCells = Math.min(MAX_WINDOW, windowCells + 2);
    if (lastMapId) render(lastMapId);
  }

  function bindZoomButtons() {
    const inBtn = document.getElementById('zoom-in-btn');
    const outBtn = document.getElementById('zoom-out-btn');
    if (inBtn) inBtn.addEventListener('click', zoomIn);
    if (outBtn) outBtn.addEventListener('click', zoomOut);
  }

  bindZoomButtons();

  return { render, zoomIn, zoomOut };
})();