/* ============================================================
   Conquest of Inazuma — Minimap Widget
   Renders the CURRENT map's full room grid as an SVG, deriving
   each room's visual state from GameState + the map's own
   overrides, rather than storing state redundantly.
============================================================ */

const Minimap = (() => {

  const CELL = 40;
  const GAP = 10;
  const STEP = CELL + GAP;

  function container() { return document.getElementById('minimap-render'); }

  function parseKey(key) {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  }

  // Is the edge between two adjacent rooms blocked? Checks the override
  // on EITHER endpoint pointing at the other — explore.js only ever
  // checks the source room's override when moving, but for the map
  // overview we want an edge to read as locked from either side.
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
    const map = MapRegistry.get(mapId);
    const el = container();
    if (!map || !el) return;

    const currentRoomId = GameState.getPosition().roomId;
    const keys = Object.keys(map.rooms);
    const coords = keys.map(parseKey);

    const minX = Math.min(...coords.map(c => c.x));
    const maxX = Math.max(...coords.map(c => c.x));
    const minY = Math.min(...coords.map(c => c.y));
    const maxY = Math.max(...coords.map(c => c.y));

    const width  = (maxX - minX + 1) * STEP;
    const height = (maxY - minY + 1) * STEP;

    const px = (x) => (x - minX) * STEP + GAP / 2;
    const py = (y) => (y - minY) * STEP + GAP / 2;

    let edgesSvg = '';
    let nodesSvg = '';

    keys.forEach(key => {
      const { x, y } = parseKey(key);
      const roomId = map.rooms[key];
      const room = RoomRegistry.get(roomId);

      // Draw edges only "forward" (east/south) to avoid double-drawing —
      // the neighbor's west/north pass would just redraw the same line.
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

      // Determine this room's state.
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

    el.innerHTML = `<svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${edgesSvg}${nodesSvg}</svg>`;
  }

  return { render };
})();