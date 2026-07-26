const watatsumiRooms = {
  watatsumi_dock: {
    mapId: "watatsumi",
    coord: { x: 0, y: 0 },
    text: [
      "Rain hammers the wooden dock. Somewhere north, lantern-light bleeds through the storm.",
      "A watchpost stands empty at the pier's edge — its brazier long since drowned by the weather. Whoever should be standing guard here has better sense than to do it in this downpour."
    ],
    extraActions: []
  },

  watatsumi_market_street: {
    mapId: "watatsumi",
    coord: { x: 0, y: -1 },
	poi: 'shop',
    text: [
      "Shuttered stalls line a narrow street. Business has not been kind since the Decree.",
      "A few merchants still keep their lamps lit, more out of stubbornness than hope of custom. Faded prayer strips, soaked through, cling to a rope strung between two eaves — offerings to a sea god the capital would rather people forgot."
    ],
    extraActions: [
      {
        label: "Talk to Merchant",
        onSelect(ctx, { GameState }) {
          ctx.setText([
            "The merchant eyes you before speaking, voice low. \"Not many strangers come through anymore. Fewer still come through and mean us no trouble.\"",
            "\"If you're here about the Resistance, walk north and keep walking. If you're here about anything else, I'd rather not know.\""
          ]);
        }
      }
    ]
  },

  watatsumi_shrine_path: {
    mapId: "watatsumi",
    coord: { x: 0, y: -2 },
    text: [
      "A weathered stone path climbs toward a shrine gate half-swallowed by moss and sea-spray.",
      "Someone has recently cleared debris from the steps — recently enough that the wood shavings haven't yet gone soft with rain. Watatsumi still tends its shrine, Decree or no Decree."
    ],
    extraActions: []
  },

  watatsumi_resistance_camp: {
    mapId: "watatsumi",
    coord: { x: -1, y: -2 },
	poi: 'event',
    text: [
      "Tucked behind a windbreak of black rock, a cluster of tents and cookfires marks a Resistance waypoint.",
      "Watatsumi soldiers move between the tents with the unhurried efficiency of people who have done this a long time. A woman studying a hand-drawn map glances up at you — appraising, not hostile. Not yet."
    ],
    extraActions: [
      {
        label: "Approach the Officer",
        onSelect(ctx, { GameState }) {
          GameState.setFlag("met_resistance_officer");
          ctx.setText([
            "\"You're not one of ours,\" the officer says, folding her map away. \"Doesn't mean you're not useful. Divine Priestess Kokomi doesn't turn away hands that want to help — but she does ask why they're offered.\"",
            "She waits for your answer."
          ]);
        }
      }
    ]
  },

  watatsumi_tidepools: {
    mapId: "watatsumi",
    coord: { x: 1, y: -1 },
    text: [
      "Wide tidepools stretch toward the breakers, strange for how still they sit even as the storm churns the open water beyond.",
      "Something enormous shaped these stones once, long before there was a dock or a shrine or a Decree to argue over. The locals don't swim here after dark. They don't say why, and you don't ask."
    ],
    extraActions: []
  },

  watatsumi_sacred_grotto: {
    mapId: "watatsumi",
    coord: { x: 0, y: -3 },
    text: [
      "The path ends at a sea-cave mouth, salt-crusted carvings of a great serpent worn nearly smooth by centuries of tide.",
      "This is as close as most are permitted to Orobashi's resting place. The air here is heavier than it should be — grief given geography."
    ],
    extraActions: []
  }
};

Object.entries(watatsumiRooms).forEach(([id, room]) => RoomRegistry.register(id, room));