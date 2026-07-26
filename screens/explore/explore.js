/* Generic "you are standing in a room" screen.
   Handles ANY room, on ANY map, by reading Map + Room data
   and building the button deck from cardinal directions + extras. */

Engine.register('explore', (() => {

  const DIRS = [
    { key: 'north', dx: 0, dy: -1 },
    { key: 'south', dx: 0, dy: 1  },
    { key: 'east',  dx: 1, dy: 0  },
    { key: 'west',  dx: -1, dy: 0 }
  ];

  function coordKey(x, y) { return `${x},${y}`; }
  function getMap(mapId) { return MapRegistry.get(mapId); }
  function getRoom(roomId) { return RoomRegistry.get(roomId); }

  function renderRoom(ctx, mapId, roomId) {
    const map = getMap(mapId);
    const room = getRoom(roomId);

    if (!map || !room) {
      console.error(`[explore] missing map/room: ${mapId}/${roomId}`);
      return;
    }

    GameState.setPosition(mapId, roomId);
    ctx.setText(room.text);

    // ---------- Compass ----------
    // Always renders all 4 directions; a gated or nonexistent exit
    // shows as disabled/greyed rather than disappearing.
    const overrideForRoom = map.overrides[coordKey(room.coord.x, room.coord.y)] || {};

    const compassDirs = DIRS.map(dir => {
      const targetCoord = coordKey(room.coord.x + dir.dx, room.coord.y + dir.dy);
      const targetRoomId = map.rooms[targetCoord];
      const override = overrideForRoom[dir.key];
      const gated = override && override.locked && !GameState.hasFlag(override.requiresFlag);

      return {
        key: dir.key,
        enabled: !!targetRoomId && !gated,
        onSelect: targetRoomId ? () => renderRoom(ctx, mapId, targetRoomId) : null
      };
    });

    Compass.render(compassDirs);
	Minimap.render(mapId);

    // ---------- Button deck: extraActions only now ----------
    const buttons = [];
    let slot = 1;

    (room.extraActions || []).forEach(extra => {
      if (slot > 10) return; // overflow handling still a known gap
      buttons.push({
        slot: slot++,
        label: extra.label,
        action: () => extra.onSelect(ctx, { GameState, renderRoom })
      });
    });

    ctx.setButtons(buttons);
  }

  return {
    layout: 'generic',
    onEnter(ctx, params) {
      const { mapId, roomId } = params;
      renderRoom(ctx, mapId, roomId);
    }
  };
})());