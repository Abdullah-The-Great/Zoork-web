import type { Room } from "../types";

export const ROOMS: Record<string, Room> = {
  foyer: {
    name: "Foyer",
    desc: "A creepy entrance hall with cobwebs and flickering candlelight. A note is pinned to the wall. The air smells of burnt wax.",
    items: ["candle", "note", "witch-hat", "pumpkin"],
    passages: {
      north: { to: "hallway", key: "orange-key" },
    },
  },
  hallway: {
    name: "Hallway",
    desc: "A long hallway lit by flickering sconces. A large portrait of a stern witch hangs on the wall. The eyes seem to follow you.",
    items: ["candelabra", "portrait"],
    passages: {
      south: { to: "foyer", key: "orange-key" },
      east: { to: "kitchen" },
      west: { to: "library", key: "black-key" },
      north: { to: "bedroom", key: "pumpkin-key" },
    },
  },
  kitchen: {
    name: "Kitchen",
    desc: "A dusty kitchen with rusty pots and strange smells. A large cauldron sits in the center, bubbling faintly.",
    items: ["cauldron", "bottle-of-bat-wings", "cursed-spoon"],
    passages: {
      west: { to: "hallway" },
      down: { to: "basement" },
    },
  },
  library: {
    name: "Library",
    desc: "Shelves full of ancient dusty spellbooks tower above you. A pedestal holds a glowing crystal ball.",
    items: ["ancient-spellbook", "crystal-ball", "witches-broom"],
    passages: {
      east: { to: "hallway", key: "black-key" },
      north: { to: "garden" },
    },
  },
  garden: {
    name: "Garden",
    desc: "An overgrown graveyard with crooked tombstones. A thick broom leans against the gate. Moonlight barely pierces the clouds.",
    items: ["grave-marker", "black-cat-statue", "spider"],
    passages: {
      south: { to: "library" },
    },
  },
  basement: {
    name: "Basement",
    desc: "Dark and damp. You can barely see your hands. Faint whispers echo around you. Something rattles in the corner.",
    items: ["chains", "loose-stone"],
    dark: true,
    passages: {
      up: { to: "kitchen" },
    },
  },
  attic: {
    name: "Attic",
    desc: "Full of broken toys and eerie shadows. A large dusty trunk sits in the corner. A ragged doll slumps against the wall.",
    items: ["ragged-doll", "old-photo", "dusty-trunk"],
    passages: {
      down: { to: "bedroom" },
    },
  },
  bedroom: {
    name: "Bedroom",
    desc: "An old bedroom with a creaky bed and torn curtains. A locked diary sits on the nightstand. A ladder leads up to the attic.",
    items: ["tattered-cloak", "locked-diary", "lantern"],
    passages: {
      south: { to: "hallway", key: "pumpkin-key" },
      east: { to: "bathroom" },
      west: { to: "study", key: "witch-key" },
      up: { to: "attic" },
    },
  },
  bathroom: {
    name: "Bathroom",
    desc: "A cracked mirror and a rusty clawfoot tub. A strange potion bottle sits on the edge of the sink. The window is boarded shut.",
    items: ["mirror-shard", "potion-bottle", "moldy-towel"],
    passages: {
      west: { to: "bedroom" },
    },
  },
  study: {
    name: "Study",
    desc: "A desk cluttered with strange artifacts. A glowing seal on the cabinet pulses with dark energy. The Magic Pumpkin Head must be inside.",
    items: ["quill-pen", "cursed-amulet"],
    passages: {
      east: { to: "bedroom", key: "witch-key" },
    },
  },
};
