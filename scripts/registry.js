/* ============================================================
   Conquest of Inazuma — Map & Room Registries
   Maps and Rooms are static content files; each one calls
   .register() on itself so explore.js can look it up by ID.
============================================================ */

const MapRegistry = (() => {
  const maps = {};
  function register(id, mapDef) { maps[id] = mapDef; }
  function get(id) { return maps[id]; }
  return { register, get };
})();

const RoomRegistry = (() => {
  const rooms = {};
  function register(id, roomDef) { rooms[id] = roomDef; }
  function get(id) { return rooms[id]; }
  return { register, get };
})();