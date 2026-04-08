import type { Room } from "../types";

export const ROOMS: Record<string, Room> = {
  foyer: {
    name: "Foyer",
    desc: "A creepy entrance hall with cobwebs and flickering candlelight.",
    items: [
      "pumpkin",
      "witch-hat",
      "rusty-key",
      "orange-key",
      "black-key",
      "witch-key",
      "pumpkin-key",
    ],
    passages: {
      north: { to: "hallway", key: "orange-key" },
    },
  },
  hallway: {
    name: "Hallway",
    desc: "A long hallway lit by flickering sconces.",
    items: ["candelabra", "portrait", "mirror-shard"],
    passages: {
      south: { to: "foyer", key: "orange-key" },
      east: { to: "kitchen" },
      west: { to: "library", key: "black-key" },
      north: { to: "bedroom", key: "pumpkin-key" },
    },
  },
  kitchen: {
    name: "Kitchen",
    desc: "A dusty kitchen with rusty pots and strange smells.",
    items: ["cauldron", "bottle-of-bat-wings", "cursed-spoon"],
    passages: {
      west: { to: "hallway" },
      down: { to: "basement" },
    },
  },
  library: {
    name: "Library",
    desc: "Shelves full of ancient, dusty spellbooks.",
    items: ["ancient-spellbook", "crystal-ball", "witches'-broom"],
    passages: {
      east: { to: "hallway", key: "black-key" },
      north: { to: "garden" },
    },
  },
  garden: {
    name: "Garden",
    desc: "An overgrown graveyard with crooked tombstones.",
    items: ["grave-marker", "black-cat-statue", "spider"],
    passages: {
      south: { to: "library" },
    },
  },
  basement: {
    name: "Basement",
    desc: "Dark and damp, you hear faint whispers.",
    items: ["ghost-lantern", "chains", "skull"],
    passages: {
      up: { to: "kitchen" },
    },
  },
  attic: {
    name: "Attic",
    desc: "Full of broken toys and eerie shadows.",
    items: ["ragged-doll", "old-photo", "dusty-trunk"],
    passages: {
      down: { to: "bedroom" },
    },
  },
  bedroom: {
    name: "Bedroom",
    desc: "An old bedroom with a creaky bed and torn curtains.",
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
    desc: "A cracked mirror and a rusty clawfoot tub.",
    items: ["broken-razor", "moldy-towel", "spiderweb"],
    passages: {
      west: { to: "bedroom" },
    },
  },
  study: {
    name: "Study",
    desc: "A desk cluttered with potion bottles and strange artifacts.",
    items: ["potion-bottle", "quill-pen", "cursed-amulet"],
    passages: {
      east: { to: "bedroom", key: "witch-key" },
    },
  },
};
