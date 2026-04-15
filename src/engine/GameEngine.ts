import { ROOMS } from "../data/rooms";
import { ITEM_DESCS, RITUAL_ITEMS, OBJECTIVES } from "../data/items";
import type { GameState, LogMessage, MessageType } from "../types";

const DIR_ALIASES: Record<string, string> = {
  n: "north",
  s: "south",
  e: "east",
  w: "west",
  u: "up",
  d: "down",
};

let _msgId = 0;
function makeMsg(html: string, type: MessageType): LogMessage {
  return { id: _msgId++, html, type };
}

export function makeIntroMessage(
  html: string,
  type: MessageType = "system",
): LogMessage {
  return makeMsg(html, type);
}

function itemSpan(name: string) {
  return `<span class="text-orange-400">${name}</span>`;
}

function hasItem(state: GameState, item: string): boolean {
  return state.inventory.includes(item);
}

function hasLight(state: GameState): boolean {
  return (
    hasItem(state, "candle") ||
    hasItem(state, "ghost-lantern") ||
    hasItem(state, "lantern")
  );
}

export function initGameState(): GameState {
  const roomItems: Record<string, string[]> = {};
  for (const [id, room] of Object.entries(ROOMS)) {
    roomItems[id] = [...room.items];
  }
  return {
    currentRoom: "foyer",
    inventory: [],
    roomItems,
    flags: {},
    isOver: false,
    won: false,
  };
}

export function describeRoom(state: GameState): LogMessage[] {
  const room = ROOMS[state.currentRoom];
  const msgs: LogMessage[] = [];
  msgs.push(makeMsg(`🕯 <strong>${room.name}</strong>`, "system"));

  // Dark room check
  if (room.dark && !hasLight(state)) {
    msgs.push(
      makeMsg(
        "It is pitch black. You can't see anything. You need a light source.",
        "error",
      ),
    );
    msgs.push(makeMsg("Exits: up", "info"));
    return msgs;
  }

  msgs.push(makeMsg(room.desc, "player"));
  const ri = state.roomItems[state.currentRoom];
  if (ri.length) {
    msgs.push(makeMsg("You see: " + ri.map(itemSpan).join(", "), "info"));
  } else {
    msgs.push(makeMsg("There is nothing of interest here.", "info"));
  }
  const exits = Object.keys(room.passages);
  msgs.push(
    makeMsg("Exits: " + (exits.length ? exits.join(", ") : "none"), "info"),
  );
  return msgs;
}

export function processCommand(
  raw: string,
  state: GameState,
): { nextState: GameState; messages: LogMessage[] } {
  const tokens = raw.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const msgs: LogMessage[] = [];
  if (!tokens.length) return { nextState: state, messages: msgs };

  msgs.push(
    makeMsg(`<span class="text-slate-500">&gt; ${raw}</span>`, "player"),
  );

  const cmd = tokens[0];
  const args = tokens.slice(1);
  const next: GameState = {
    ...state,
    roomItems: { ...state.roomItems },
    inventory: [...state.inventory],
    flags: { ...state.flags },
  };

  // multi-word shorthand
  if (
    (cmd === "take" || cmd === "get" || cmd === "pick") &&
    args[0] === "all"
  ) {
    return cmdTakeAll(next, msgs);
  }

  // use X on Y
  if (cmd === "use") {
    const onIdx = args.indexOf("on");
    if (onIdx !== -1) {
      const item = args.slice(0, onIdx).join("-");
      const target = args.slice(onIdx + 1).join("-");
      return cmdUseOn(item, target, next, msgs);
    }
    return cmdUse(args.join("-"), next, msgs);
  }

  switch (cmd) {
    case "go":
      return cmdGo(args, next, msgs);
    case "look":
    case "inspect":
      return cmdLook(args, next, msgs);
    case "take":
    case "get":
      return cmdTake(args, next, msgs);
    case "drop":
      return cmdDrop(args, next, msgs);
    case "inventory":
    case "inv":
      return cmdInventory(next, msgs);
    case "objectives":
    case "obj":
      return cmdObjectives(next, msgs);
    case "hint":
      return cmdHint(next, msgs);
    case "quit":
    case "exit":
      return cmdQuit(next, msgs);
    case "i_am_agent_haha":
      return cmdCheat(next, msgs);
    default:
      msgs.push(
        makeMsg(
          `I don't understand "<span class="text-slate-400">${cmd}</span>". Try: go, look, take, drop, use, inventory, objectives, hint, quit.`,
          "error",
        ),
      );
      return { nextState: next, messages: msgs };
  }
}

// ─── GO ───────────────────────────────────────────────────────────────────────
function cmdGo(args: string[], state: GameState, msgs: LogMessage[]) {
  if (!args.length) {
    msgs.push(makeMsg("Go where?", "error"));
    return { nextState: state, messages: msgs };
  }

  let dir = args[0];
  if (DIR_ALIASES[dir]) dir = DIR_ALIASES[dir];

  const room = ROOMS[state.currentRoom];
  const passage = room.passages[dir];

  if (!passage) {
    msgs.push(makeMsg("You can't go that way.", "error"));
    return { nextState: state, messages: msgs };
  }
  if (passage.key && !state.inventory.includes(passage.key)) {
    msgs.push(
      makeMsg(
        `🔒 The passage is locked. You need the ${itemSpan(passage.key)} to open it.`,
        "error",
      ),
    );
    return { nextState: state, messages: msgs };
  }
  if (passage.key) {
    msgs.push(
      makeMsg(
        `You unlock the door with the ${itemSpan(passage.key)} and pass through.`,
        "success",
      ),
    );
  }

  const next = { ...state, currentRoom: passage.to };

  // set flags on room entry
  if (passage.to === "bedroom")
    next.flags = { ...next.flags, bedroom_entered: true };
  if (passage.to === "library")
    next.flags = { ...next.flags, library_visited: true };
  if (passage.to === "study")
    next.flags = { ...next.flags, study_entered: true };

  msgs.push(makeMsg("<br/>", "info"));
  msgs.push(...describeRoom(next));
  return { nextState: next, messages: msgs };
}

// ─── LOOK ─────────────────────────────────────────────────────────────────────
function cmdLook(args: string[], state: GameState, msgs: LogMessage[]) {
  const room = ROOMS[state.currentRoom];
  if (room.dark && !hasLight(state)) {
    msgs.push(
      makeMsg(
        "It's too dark to see anything. You need a light source.",
        "error",
      ),
    );
    return { nextState: state, messages: msgs };
  }

  if (!args.length) {
    msgs.push(makeMsg("<br/>", "info"));
    msgs.push(...describeRoom(state));
    return { nextState: state, messages: msgs };
  }

  const itemName = args.join("-");
  const desc = ITEM_DESCS[itemName];
  const inRoom = state.roomItems[state.currentRoom].includes(itemName);
  const inInv = state.inventory.includes(itemName);

  if ((inRoom || inInv) && desc) {
    msgs.push(makeMsg(`${itemSpan(itemName)}: ${desc}`, "player"));
  } else {
    msgs.push(makeMsg(`You don't see any '${itemName}' here.`, "error"));
  }
  return { nextState: state, messages: msgs };
}

// ─── TAKE ─────────────────────────────────────────────────────────────────────
function cmdTake(args: string[], state: GameState, msgs: LogMessage[]) {
  if (!args.length) {
    msgs.push(makeMsg("Take what?", "error"));
    return { nextState: state, messages: msgs };
  }

  const room = ROOMS[state.currentRoom];
  if (room.dark && !hasLight(state)) {
    msgs.push(makeMsg("It's too dark to pick anything up.", "error"));
    return { nextState: state, messages: msgs };
  }

  const itemName = args.join("-");
  const ri = [...state.roomItems[state.currentRoom]];
  const idx = ri.indexOf(itemName);

  if (idx === -1) {
    msgs.push(makeMsg(`There is no ${itemSpan(itemName)} here.`, "error"));
    return { nextState: state, messages: msgs };
  }

  ri.splice(idx, 1);
  const next: GameState = {
    ...state,
    inventory: [...state.inventory, itemName],
    roomItems: { ...state.roomItems, [state.currentRoom]: ri },
  };

  // flag updates on take
  if (itemName === "candle" || itemName === "ghost-lantern") {
    next.flags = { ...next.flags, has_light: true };
  }

  msgs.push(makeMsg(`You take the ${itemSpan(itemName)}.`, "success"));
  return { nextState: next, messages: msgs };
}

// ─── TAKE ALL ─────────────────────────────────────────────────────────────────
function cmdTakeAll(state: GameState, msgs: LogMessage[]) {
  const room = ROOMS[state.currentRoom];
  if (room.dark && !hasLight(state)) {
    msgs.push(makeMsg("It's too dark to pick anything up.", "error"));
    return { nextState: state, messages: msgs };
  }

  const ri = [...state.roomItems[state.currentRoom]];
  if (ri.length === 0) {
    msgs.push(makeMsg("There is nothing here to take.", "info"));
    return { nextState: state, messages: msgs };
  }

  const next: GameState = {
    ...state,
    inventory: [...state.inventory, ...ri],
    roomItems: { ...state.roomItems, [state.currentRoom]: [] },
    flags: { ...state.flags },
  };

  if (ri.includes("candle") || ri.includes("ghost-lantern")) {
    next.flags.has_light = true;
  }

  msgs.push(makeMsg("You pick up everything:", "success"));
  ri.forEach((item) => msgs.push(makeMsg(`  + ${itemSpan(item)}`, "success")));
  return { nextState: next, messages: msgs };
}

// ─── DROP ─────────────────────────────────────────────────────────────────────
function cmdDrop(args: string[], state: GameState, msgs: LogMessage[]) {
  if (!args.length) {
    msgs.push(makeMsg("Drop what?", "error"));
    return { nextState: state, messages: msgs };
  }

  const itemName = args.join("-");
  const idx = state.inventory.indexOf(itemName);
  if (idx === -1) {
    msgs.push(makeMsg(`You don't have a ${itemSpan(itemName)}.`, "error"));
    return { nextState: state, messages: msgs };
  }

  const inv = [...state.inventory];
  inv.splice(idx, 1);
  const ri = [...state.roomItems[state.currentRoom], itemName];
  const next: GameState = {
    ...state,
    inventory: inv,
    roomItems: { ...state.roomItems, [state.currentRoom]: ri },
  };
  msgs.push(makeMsg(`You drop the ${itemSpan(itemName)}.`, "info"));
  return { nextState: next, messages: msgs };
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────
function cmdInventory(state: GameState, msgs: LogMessage[]) {
  if (!state.inventory.length) {
    msgs.push(makeMsg("You have nothing in your inventory.", "info"));
  } else {
    msgs.push(
      makeMsg(
        "You are carrying: " + state.inventory.map(itemSpan).join(", "),
        "player",
      ),
    );
  }
  return { nextState: state, messages: msgs };
}

// ─── USE ──────────────────────────────────────────────────────────────────────
function cmdUse(item: string, state: GameState, msgs: LogMessage[]) {
  if (!hasItem(state, item)) {
    msgs.push(makeMsg(`You don't have a ${itemSpan(item)}.`, "error"));
    return { nextState: state, messages: msgs };
  }

  const next = {
    ...state,
    flags: { ...state.flags },
    roomItems: { ...state.roomItems },
    inventory: [...state.inventory],
  };

  switch (item) {
    case "candle":
      msgs.push(
        makeMsg(
          "The candle flickers, casting warm light around you.",
          "success",
        ),
      );
      next.flags.has_light = true;
      break;

    case "crystal-ball":
      msgs.push(
        makeMsg(
          "You gaze into the crystal ball... A vision forms: <em>a lantern glowing green beneath a loose stone in the basement floor.</em>",
          "system",
        ),
      );
      break;

    case "potion-bottle":
      msgs.push(
        makeMsg(
          "You drink the potion. A voice whispers your current objectives:",
          "system",
        ),
      );
      return cmdHint(next, msgs);

    case "ragged-doll":
      msgs.push(
        makeMsg(
          "The doll's arm slowly rises and points toward the dusty trunk in the corner.",
          "system",
        ),
      );
      break;

    case "tattered-cloak":
      msgs.push(
        makeMsg(
          "You wrap the cloak around yourself. You feel strangely brave.",
          "success",
        ),
      );
      next.flags.wearing_cloak = true;
      break;

    case "black-cat-statue":
      msgs.push(
        makeMsg(
          "The statue's eyes glow. It hisses and points its paw downward — toward the basement.",
          "system",
        ),
      );
      break;

    case "cursed-amulet":
      if (state.currentRoom !== "study") {
        msgs.push(
          makeMsg("The amulet pulses but nothing happens here.", "info"),
        );
      } else {
        msgs.push(
          makeMsg(
            "You hold the amulet toward the glowing seal. It CRACKS. The seal is weakened!",
            "success",
          ),
        );
        next.flags.seal_weakened = true;
      }
      break;

    case "quill-pen":
      msgs.push(
        makeMsg(
          "You write something on the wall: 'I was here.' Probably not helpful.",
          "info",
        ),
      );
      break;

    case "bottle-of-bat-wings":
      msgs.push(
        makeMsg(
          "You shake the bottle. The bat wings rattle. Disgusting.",
          "info",
        ),
      );
      break;

    default:
      msgs.push(
        makeMsg(
          `You're not sure how to use the ${itemSpan(item)} by itself. Try 'use ${item} on <something>'.`,
          "info",
        ),
      );
  }

  return { nextState: next, messages: msgs };
}

// ─── USE ON ───────────────────────────────────────────────────────────────────
function cmdUseOn(
  item: string,
  target: string,
  state: GameState,
  msgs: LogMessage[],
) {
  if (!hasItem(state, item)) {
    msgs.push(makeMsg(`You don't have a ${itemSpan(item)}.`, "error"));
    return { nextState: state, messages: msgs };
  }

  const next = {
    ...state,
    flags: { ...state.flags },
    roomItems: { ...state.roomItems },
    inventory: [...state.inventory],
  };
  const inRoom = (t: string) => next.roomItems[next.currentRoom].includes(t);
  const addToRoom = (i: string) => {
    next.roomItems[next.currentRoom] = [...next.roomItems[next.currentRoom], i];
  };
  const removeFromRoom = (i: string) => {
    next.roomItems[next.currentRoom] = next.roomItems[next.currentRoom].filter(
      (x) => x !== i,
    );
  };

  const combo = `${item}|${target}`;

  switch (combo) {
    // candle on cauldron → reveals orange-key
    case "candle|cauldron":
      if (!inRoom("cauldron")) {
        msgs.push(makeMsg("There's no cauldron here.", "error"));
        break;
      }
      if (next.flags.cauldron_searched) {
        msgs.push(makeMsg("You already searched the cauldron.", "info"));
        break;
      }
      msgs.push(
        makeMsg(
          "You lower the candle into the cauldron. Through the bubbling liquid you spot something glinting at the bottom...",
          "system",
        ),
      );
      msgs.push(
        makeMsg(
          `An ${itemSpan("orange-key")} rises to the surface!`,
          "success",
        ),
      );
      addToRoom("orange-key");
      next.flags.cauldron_searched = true;
      next.flags.orange_key_found = true;
      break;

    // witches-broom on grave-marker → reveals black-key
    case "witches-broom|grave-marker":
      if (!inRoom("grave-marker")) {
        msgs.push(makeMsg("There's no grave marker here.", "error"));
        break;
      }
      if (next.flags.grave_swept) {
        msgs.push(makeMsg("You already swept around the grave.", "info"));
        break;
      }
      msgs.push(
        makeMsg(
          "You sweep the dirt away from the grave marker. The earth shifts and something dark emerges...",
          "system",
        ),
      );
      msgs.push(
        makeMsg(
          `A ${itemSpan("black-key")} was buried beneath the soil!`,
          "success",
        ),
      );
      addToRoom("black-key");
      next.flags.grave_swept = true;
      next.flags.black_key_found = true;
      break;

    // mirror-shard on portrait → reveals pumpkin-key
    case "mirror-shard|portrait":
      if (!inRoom("portrait")) {
        msgs.push(makeMsg("There's no portrait here.", "error"));
        break;
      }
      if (next.flags.mirror_used) {
        msgs.push(makeMsg("You already revealed what was hidden.", "info"));
        break;
      }
      msgs.push(
        makeMsg(
          "You angle the mirror shard toward the portrait. A beam of reflected light hits the frame and a hidden compartment springs open!",
          "system",
        ),
      );
      msgs.push(
        makeMsg(
          `A ${itemSpan("pumpkin-key")} falls from the hidden compartment!`,
          "success",
        ),
      );
      addToRoom("pumpkin-key");
      next.flags.mirror_used = true;
      break;

    // chains on loose-stone → reveals ghost-lantern and skull
    case "chains|loose-stone":
      if (!inRoom("loose-stone")) {
        msgs.push(makeMsg("There's no loose stone here.", "error"));
        break;
      }
      if (next.flags.stone_moved) {
        msgs.push(makeMsg("You already moved the stone.", "info"));
        break;
      }
      if (ROOMS[next.currentRoom].dark && !hasLight(next)) {
        msgs.push(makeMsg("It's too dark to do that.", "error"));
        break;
      }
      msgs.push(
        makeMsg(
          "You loop the chains around the loose stone and pull. It scrapes across the floor revealing a hidden cavity below!",
          "system",
        ),
      );
      msgs.push(
        makeMsg(
          `You find a ${itemSpan("ghost-lantern")} and a ${itemSpan("skull")}!`,
          "success",
        ),
      );
      removeFromRoom("loose-stone");
      addToRoom("ghost-lantern");
      addToRoom("skull");
      next.flags.stone_moved = true;
      break;

    // rusty-key on locked-diary → reveals witch-key
    case "rusty-key|locked-diary":
      if (!inRoom("locked-diary") && !hasItem(state, "locked-diary")) {
        msgs.push(makeMsg("There's no locked diary here.", "error"));
        break;
      }
      if (next.flags.diary_opened) {
        msgs.push(makeMsg("The diary is already open.", "info"));
        break;
      }
      msgs.push(
        makeMsg(
          "The rusty key fits perfectly into the diary's lock. It clicks open. Inside you find a witch-key taped to the last page and a final entry: <em>'The four sacred items will break the seal. Beware the study.'</em>",
          "system",
        ),
      );
      msgs.push(
        makeMsg(`A ${itemSpan("witch-key")} was hidden inside!`, "success"),
      );
      // remove locked-diary from wherever it is, add opened-diary flavor and witch-key
      next.roomItems[next.currentRoom] = next.roomItems[
        next.currentRoom
      ].filter((x) => x !== "locked-diary");
      next.inventory = next.inventory.filter((x) => x !== "locked-diary");
      addToRoom("witch-key");
      next.flags.diary_opened = true;
      break;

    // skull on dusty-trunk → opens trunk, reveals rusty-key
    case "skull|dusty-trunk":
      if (!inRoom("dusty-trunk")) {
        msgs.push(makeMsg("There's no dusty trunk here.", "error"));
        break;
      }
      if (next.flags.trunk_opened) {
        msgs.push(makeMsg("The trunk is already open.", "info"));
        break;
      }
      msgs.push(
        makeMsg(
          "You press the carved skull against the trunk's lock. The symbols align and the trunk flies open with a creak!",
          "system",
        ),
      );
      msgs.push(
        makeMsg(`Inside you find a ${itemSpan("rusty-key")}!`, "success"),
      );
      removeFromRoom("dusty-trunk");
      addToRoom("rusty-key");
      next.flags.trunk_opened = true;
      break;

    // ancient-spellbook on seal (in study, after weakening)
    case "ancient-spellbook|seal":
    case "crystal-ball|seal":
    case "ghost-lantern|seal":
    case "skull|seal": {
      if (next.currentRoom !== "study") {
        msgs.push(makeMsg("There is no seal here.", "error"));
        break;
      }
      if (!next.flags.seal_weakened) {
        msgs.push(
          makeMsg(
            "The seal is too strong. You need to weaken it first with the cursed amulet.",
            "error",
          ),
        );
        break;
      }
      const hasAll = RITUAL_ITEMS.every((r) => hasItem(next, r));
      if (!hasAll) {
        const missing = RITUAL_ITEMS.filter((r) => !hasItem(next, r));
        msgs.push(
          makeMsg(
            `The seal flickers but holds. You still need: ${missing.map(itemSpan).join(", ")}`,
            "error",
          ),
        );
        break;
      }
      // WIN
      msgs.push(makeMsg("<br/>", "info"));
      msgs.push(
        makeMsg("⚡ The four ritual items SURGE with power!", "system"),
      );
      msgs.push(
        makeMsg("The seal SHATTERS. The cabinet swings open...", "system"),
      );
      msgs.push(
        makeMsg(
          `The ${itemSpan("magic-pumpkin-head")} floats out, glowing brilliantly!`,
          "success",
        ),
      );
      msgs.push(makeMsg("<br/>", "info"));
      msgs.push(makeMsg("🎃 <strong>HAPPY HALLOWEEN!</strong> 🎃", "system"));
      msgs.push(
        makeMsg(
          "You have broken the Ghost Witch's curse and escaped Hilltop Manor!",
          "success",
        ),
      );
      msgs.push(
        makeMsg(
          "The manor fades around you as dawn breaks. You are free.",
          "player",
        ),
      );
      next.inventory = [...next.inventory, "magic-pumpkin-head"];
      next.flags.won = true;
      next.won = true;
      next.isOver = true;
      break;
    }

    default:
      msgs.push(
        makeMsg(
          `Nothing happens when you use ${itemSpan(item)} on ${itemSpan(target)}.`,
          "info",
        ),
      );
  }

  return { nextState: next, messages: msgs };
}

// ─── OBJECTIVES ───────────────────────────────────────────────────────────────
function cmdObjectives(state: GameState, msgs: LogMessage[]) {
  msgs.push(makeMsg("📋 <strong>Objectives:</strong>", "system"));
  OBJECTIVES.forEach(({ flag, text }) => {
    const done = !!state.flags[flag];
    msgs.push(
      makeMsg(`${done ? "✅" : "⬜"} ${text}`, done ? "success" : "info"),
    );
  });
  return { nextState: state, messages: msgs };
}

// ─── HINT ─────────────────────────────────────────────────────────────────────
function cmdHint(state: GameState, msgs: LogMessage[]) {
  msgs.push(makeMsg("💡 <strong>Hint:</strong>", "system"));

  if (!state.flags.has_light) {
    msgs.push(
      makeMsg(
        "Take the candle from the foyer — you'll need it in dark rooms.",
        "info",
      ),
    );
  } else if (!state.flags.orange_key_found) {
    msgs.push(
      makeMsg("Try: <em>use candle on cauldron</em> in the kitchen.", "info"),
    );
  } else if (!state.flags.black_key_found) {
    msgs.push(
      makeMsg(
        "Get the broom from the library... wait, you need the black key for that. Head to the basement first and move the loose stone with the chains.",
        "info",
      ),
    );
  } else if (!state.flags.library_visited) {
    msgs.push(
      makeMsg(
        "You have the black key — head west from the hallway to enter the library.",
        "info",
      ),
    );
  } else if (!state.flags.grave_swept) {
    msgs.push(
      makeMsg(
        "Take the broom from the library and go to the garden. Try: <em>use witches-broom on grave-marker</em>.",
        "info",
      ),
    );
  } else if (!state.flags.mirror_used) {
    msgs.push(
      makeMsg(
        "Take the mirror shard from the bathroom, then go to the hallway and try: <em>use mirror-shard on portrait</em>.",
        "info",
      ),
    );
  } else if (!state.flags.bedroom_entered) {
    msgs.push(
      makeMsg("You have the pumpkin key! Head north from the hallway.", "info"),
    );
  } else if (!state.flags.trunk_opened) {
    msgs.push(
      makeMsg(
        "Go up to the attic. You need the skull from the basement. Try: <em>use skull on dusty-trunk</em>.",
        "info",
      ),
    );
  } else if (!state.flags.diary_opened) {
    msgs.push(
      makeMsg(
        "Use the rusty key from the trunk on the locked diary in the bedroom.",
        "info",
      ),
    );
  } else if (!state.flags.study_entered) {
    msgs.push(
      makeMsg("You have the witch key! Head west from the bedroom.", "info"),
    );
  } else if (!state.flags.seal_weakened) {
    msgs.push(
      makeMsg("Use the cursed amulet in the study to weaken the seal.", "info"),
    );
  } else {
    msgs.push(
      makeMsg(
        "Use all four ritual items on the seal: ancient-spellbook, crystal-ball, ghost-lantern, skull.",
        "info",
      ),
    );
  }

  return { nextState: state, messages: msgs };
}

// ─── QUIT ─────────────────────────────────────────────────────────────────────
function cmdQuit(state: GameState, msgs: LogMessage[]) {
  msgs.push(
    makeMsg(
      "🎃 Happy Halloween! Thanks for exploring Hilltop Manor.",
      "system",
    ),
  );
  msgs.push(makeMsg("Refresh the page to play again.", "info"));
  return { nextState: { ...state, isOver: true }, messages: msgs };
}

// ─── CHEAT ────────────────────────────────────────────────────────────────────
function cmdCheat(state: GameState, msgs: LogMessage[]) {
  const allItems = Object.values(state.roomItems).flat();
  const allKeys = [
    "orange-key",
    "black-key",
    "pumpkin-key",
    "rusty-key",
    "witch-key",
  ];
  const next: GameState = {
    ...state,
    inventory: [...new Set([...state.inventory, ...allItems, ...allKeys])],
    roomItems: Object.fromEntries(
      Object.keys(state.roomItems).map((r) => [r, []]),
    ),
    flags: {
      ...state.flags,
      has_light: true,
      orange_key_found: true,
      black_key_found: true,
      library_visited: true,
      grave_swept: true,
      bathroom_unlocked: true,
      mirror_used: true,
      bedroom_entered: true,
      trunk_opened: true,
      diary_opened: true,
      study_entered: true,
      stone_moved: true,
      cauldron_searched: true,
      seal_weakened: true,
    },
  };
  msgs.push(makeMsg("🕵️ <strong>AGENT HAHA ACTIVATED</strong>", "system"));
  msgs.push(
    makeMsg("All items collected. All keys added. All flags set.", "success"),
  );
  msgs.push(
    makeMsg(
      "You are carrying: " + next.inventory.map(itemSpan).join(", "),
      "info",
    ),
  );
  msgs.push(
    makeMsg(
      "Head to the study → use cursed-amulet → use ancient-spellbook on seal",
      "info",
    ),
  );
  return { nextState: next, messages: msgs };
}
