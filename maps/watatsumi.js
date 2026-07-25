const watatsumiMap = {
  id: "watatsumi",
  name: "Watatsumi Island",
  entryRoomId: "watatsumi_dock",
  rooms: {
    "0,0":  "watatsumi_dock",
    "0,-1": "watatsumi_market_street"
  },
  overrides: {}
};

MapRegistry.register("watatsumi", watatsumiMap);