const watatsumiRooms = {
  watatsumi_dock: {
    mapId: "watatsumi",
    coord: { x: 0, y: 0 },
    text: ["Rain hammers the wooden dock. Somewhere north, lantern-light bleeds through the storm."],
    extraActions: []
  },
  watatsumi_market_street: {
    mapId: "watatsumi",
    coord: { x: 0, y: -1 },
    text: ["Shuttered stalls line a narrow street. Business has not been kind since the Decree."],
    extraActions: []
  }
};

Object.entries(watatsumiRooms).forEach(([id, room]) => RoomRegistry.register(id, room));