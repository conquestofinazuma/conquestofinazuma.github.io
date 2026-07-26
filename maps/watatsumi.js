const watatsumiMap = {
  id: "watatsumi",
  name: "Watatsumi Island",
  entryRoomId: "watatsumi_dock",
  rooms: {
    "0,0":   "watatsumi_dock",
    "0,-1":  "watatsumi_market_street",
    "0,-2":  "watatsumi_shrine_path",
    "-1,-2": "watatsumi_resistance_camp",
    "1,-1":  "watatsumi_tidepools",
    "0,-3":  "watatsumi_sacred_grotto"
  },
  overrides: {
    "0,-2": {
      west: { locked: true, requiresFlag: "met_kokomi" }
    }
  }
};

MapRegistry.register("watatsumi", watatsumiMap);