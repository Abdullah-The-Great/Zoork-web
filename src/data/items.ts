export const ITEM_DESCS: Record<string, string> = {
  // Story items
  candle:
    "A wax candle, still lit. It flickers but holds. Useful in dark places.",
  note: "A crumpled note pinned to the wall. It reads: 'The cauldron holds secrets, but only light reveals them. The broom clears the way. The mirror shows what is hidden.'",
  // Keys
  "orange-key": "A bright orange key carved from pumpkin wood. It feels warm.",
  "black-key": "A small ancient black key crusted with dirt.",
  "witch-key": "A slender key with a tiny witch-shaped handle.",
  "pumpkin-key": "A key shaped like a pumpkin, glowing faintly orange.",
  "rusty-key":
    "An old rusty key covered in strange symbols. It might open something small.",
  // Foyer
  "witch-hat":
    "A tall pointed black hat with a purple band. Smells faintly of smoke.",
  pumpkin: "A carved pumpkin with a flickering candle inside.",
  // Kitchen
  cauldron:
    "A large iron cauldron bubbling with green liquid. Too dark to see inside without light.",
  "bottle-of-bat-wings":
    "A dusty bottle filled with dried bat wings. Disgusting but valuable.",
  "cursed-spoon": "A silver spoon that feels ice cold. It stirs on its own.",
  // Library
  "ancient-spellbook":
    "A leather-bound book crackling with dark energy. One of the four ritual items.",
  "crystal-ball":
    "A cloudy crystal ball. Stare into it long enough and you see the basement floor.",
  "witches-broom":
    "A broomstick with twigs tied to the end. Good for sweeping — or breaking things.",
  // Garden
  "grave-marker":
    "A cracked tombstone. The name is faded. The dirt around it looks recently disturbed.",
  "black-cat-statue":
    "A stone statue of a black cat. Its eyes seem to glow faintly orange.",
  spider: "A large hairy spider. You dare not touch it.",
  // Basement
  "ghost-lantern":
    "An old lantern glowing with an eerie green light. One of the four ritual items.",
  chains: "Heavy rusty chains bolted to the wall. One end is loose.",
  "loose-stone":
    "A loose stone in the floor. Something might be hidden beneath it.",
  skull:
    "A human skull with mysterious carvings. One of the four ritual items.",
  // Attic
  "ragged-doll":
    "A torn doll with button eyes. One arm points toward the trunk.",
  "old-photo":
    "A faded photo of a family standing in front of the manor. Their faces are scratched out.",
  "dusty-trunk":
    "A large wooden trunk covered in dust. It has a strange lock — it looks like it needs a key with symbols.",
  // Hallway
  candelabra: "A silver candelabra holding half-melted candles.",
  portrait:
    "A portrait of a stern-looking witch. Something about it feels wrong — like it's hiding something.",
  "mirror-shard":
    "A sharp piece of a broken mirror. It reflects light in strange ways.",
  // Bedroom
  "tattered-cloak":
    "A black cloak with holes and tears. Wearing it makes you feel slightly braver.",
  "locked-diary": "A diary bound in worn leather, locked with a small keyhole.",
  lantern: "An old lantern. It's empty — needs a flame source.",
  // Bathroom
  "potion-bottle":
    "A glowing purple potion. The label says: 'Drink me when lost — I reveal the path.'",
  "moldy-towel": "A damp mildewed towel. You'd rather not touch it.",
  // Study
  "quill-pen": "A black feather quill pen dripping with ink.",
  "cursed-amulet":
    "An amulet pulsing with dark energy. It seems to weaken magical seals.",
  "magic-pumpkin-head":
    "The legendary Magic Pumpkin Head! It glows brilliantly. You have broken the curse!",
};

export const OBJECTIVES = [
  { flag: "has_light", text: "Find a light source" },
  { flag: "orange_key_found", text: "Unlock the hallway (orange key)" },
  { flag: "black_key_found", text: "Find the black key" },
  { flag: "library_visited", text: "Unlock the library" },
  { flag: "bathroom_unlocked", text: "Unlock the bathroom" },
  { flag: "mirror_used", text: "Find the pumpkin key" },
  { flag: "bedroom_entered", text: "Enter the bedroom" },
  { flag: "trunk_opened", text: "Open the dusty trunk" },
  { flag: "diary_opened", text: "Open the locked diary" },
  { flag: "study_entered", text: "Enter the study" },
  { flag: "seal_weakened", text: "Weaken the spell seal" },
  { flag: "won", text: "🎃 Claim the Magic Pumpkin Head" },
];

export const RITUAL_ITEMS = [
  "ancient-spellbook",
  "crystal-ball",
  "ghost-lantern",
  "skull",
];
