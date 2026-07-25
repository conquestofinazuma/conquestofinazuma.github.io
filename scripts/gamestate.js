/* ============================================================
   Conquest of Inazuma — Game State
   Single source of truth for "where the player is and what's
   changed." Rooms/Maps are static content; this is the mutable
   diff on top of them. This is also, eventually, our save file.
============================================================ */

const GameState = (() => {

  let state = null;

  function reset() {
    state = {
      currentMapId: null,
      currentRoomId: null,

      // Every distinct room ID the player has ever entered, across all maps.
      // Used by the minimap/full-map overlay to know what's "discovered"
      // vs. still fogged/unknown.
      visitedRooms: {},   // { roomId: true }

      // Freeform story/progress flags. e.g. flags.met_kokomi = true
      flags: {},

      inventory: [],       // array of item IDs, expand later
      // room-specific mutable stuff (looted?, npc state, etc.)
      // keyed by roomId so it survives independent of position
      roomState: {}        // { roomId: { looted: true, ... } }
    };
  }

  function setPosition(mapId, roomId) {
    state.currentMapId = mapId;
    state.currentRoomId = roomId;
    state.visitedRooms[roomId] = true;
  }

  function getPosition() {
    return { mapId: state.currentMapId, roomId: state.currentRoomId };
  }

  function hasVisited(roomId) {
    return !!state.visitedRooms[roomId];
  }

  function setFlag(name, value = true) {
    state.flags[name] = value;
  }

  function hasFlag(name) {
    return !!state.flags[name];
  }

  function getRoomState(roomId) {
    if (!state.roomState[roomId]) state.roomState[roomId] = {};
    return state.roomState[roomId];
  }

  /* ---------- Save / Load ---------- */
  // Deliberately just JSON.stringify/parse for now — the whole point
  // of keeping content (Maps/Rooms) separate from this object is that
  // this is the *entire* save file. Nothing else needs serializing.

  function serialize() {
    return JSON.stringify(state);
  }

  function deserialize(json) {
    state = JSON.parse(json);
  }

  function debugDump() {
    console.log('[GameState]', state);
  }

  reset(); // start with a fresh blank state on load

  return {
    reset, setPosition, getPosition, hasVisited,
    setFlag, hasFlag, getRoomState,
    serialize, deserialize, debugDump
  };
})();