/* Generic "you are standing in a room" screen.
   Handles ANY room, on ANY map, by reading Map + Room data
   and building the button deck from cardinal directions + extras. */

Engine.register('explore', (() => {

  const DIRS = [
    { key: 'north', dx: 0, dy: -1, label: 'North' },
    { key: 'south', dx: 0, dy: 1,  label: 'South' },
    { key: 'east',  dx: 1, dy: 0,  label: 'East'  },
    { key: 'west',  dx: -1, dy: 0, label: 'West'  }
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

    const buttons = [];
    let slot = 1;

    // Reserved-ish ordering: directions first, in a fixed order,
    // only shown if a room actually exists that way (or an override exists).
    DIRS.forEach(dir => {
      const targetCoord = coordKey(room.coord.x + dir.dx, room.coord.y + dir.dy);
      const targetRoomId = map.rooms[targetCoord];
      if (!targetRoomId) return; // nothing that direction, skip

      const override = (map.overrides[coordKey(room.coord.x, room.coord.y)] || {})[dir.key];
      if (override && override.locked && !GameState.hasFlag(override.requiresFlag)) {
        return; // gated and not yet unlocked — hidden for now (revisit: show as locked?)
      }

      buttons.push({
        slot: slot++,
        label: dir.label,
        action: () => renderRoom(ctx, mapId, targetRoomId)
      });
    });

    // Room-specific extras (shop, swim, inspect, teleport, whatever) get
    // whatever slots are left. No pagination/overflow handling yet —
    // that's a real gap once a room wants >10 total actions.
    (room.extraActions || []).forEach(extra => {
      if (slot > 10) return; // silently drop — needs real handling later
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