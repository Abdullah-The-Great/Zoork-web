import { ROOMS } from "../data/rooms";
import { ITEM_DESCS, OBJECTIVES } from "../data/items";
import type { GameState, LogMessage } from "../types";
import { makeMsg, itemSpan, hasLight } from "./helpers";
import { describeRoom } from "./GameEngine";

const DIR_ALIASES: Record<string, string> = {
  n: "north",
  s: "south",
  e: "east",
  w: "west",
  u: "up",
  d: "down",
};

export function cmdGo(args: string[], state: GameState, msgs: LogMessage[]) {
  if (!args.length) {
    msgs.push(makeMsg("Go where?", "error"));
    return { nextState: state, messages: msgs };
  }

  let dir = args[0];
  if (DIR_ALIASES[dir]) dir = DIR_ALIASES[dir];

  const passage = ROOMS[state.currentRoom].passages[dir];

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

  const next = {
    ...state,
    currentRoom: passage.to,
    visitedRooms: state.visitedRooms?.includes(passage.to)
      ? state.visitedRooms
      : [...(state.visitedRooms ?? []), passage.to],
    flags: {
      ...state.flags,
      ...(passage.to === "bedroom" && { bedroom_entered: true }),
      ...(passage.to === "library" && { library_visited: true }),
      ...(passage.to === "study" && { study_entered: true }),
    },
  };

  msgs.push(makeMsg("<br/>", "info"));
  msgs.push(...describeRoom(next));
  return { nextState: next, messages: msgs };
}

export function cmdLook(args: string[], state: GameState, msgs: LogMessage[]) {
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
    msgs.push(makeMsg(`🔍 <strong>${room.name}</strong>`, "system"));
    msgs.push(makeMsg(room.desc, "player"));
    const ri = state.roomItems[state.currentRoom];
    msgs.push(
      makeMsg(
        ri.length
          ? "You see: " + ri.map(itemSpan).join(", ")
          : "Nothing of interest here.",
        "info",
      ),
    );
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

export function cmdTake(args: string[], state: GameState, msgs: LogMessage[]) {
  if (!args.length) {
    msgs.push(makeMsg("Take what?", "error"));
    return { nextState: state, messages: msgs };
  }

  if (ROOMS[state.currentRoom].dark && !hasLight(state)) {
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
    flags: {
      ...state.flags,
      ...(itemName === "candle" || itemName === "ghost-lantern"
        ? { has_light: true }
        : {}),
    },
  };

  msgs.push(makeMsg(`You take the ${itemSpan(itemName)}.`, "success"));
  return { nextState: next, messages: msgs };
}

export function cmdTakeAll(state: GameState, msgs: LogMessage[]) {
  if (ROOMS[state.currentRoom].dark && !hasLight(state)) {
    msgs.push(makeMsg("It's too dark to pick anything up.", "error"));
    return { nextState: state, messages: msgs };
  }

  const ri = [...state.roomItems[state.currentRoom]];
  if (!ri.length) {
    msgs.push(makeMsg("There is nothing here to take.", "info"));
    return { nextState: state, messages: msgs };
  }

  const next: GameState = {
    ...state,
    inventory: [...state.inventory, ...ri],
    roomItems: { ...state.roomItems, [state.currentRoom]: [] },
    flags: {
      ...state.flags,
      ...(ri.includes("candle") || ri.includes("ghost-lantern")
        ? { has_light: true }
        : {}),
    },
  };

  msgs.push(makeMsg("You pick up everything:", "success"));
  ri.forEach((item) => msgs.push(makeMsg(`  + ${itemSpan(item)}`, "success")));
  return { nextState: next, messages: msgs };
}

export function cmdDrop(args: string[], state: GameState, msgs: LogMessage[]) {
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
  const next: GameState = {
    ...state,
    inventory: inv,
    roomItems: {
      ...state.roomItems,
      [state.currentRoom]: [...state.roomItems[state.currentRoom], itemName],
    },
  };
  msgs.push(makeMsg(`You drop the ${itemSpan(itemName)}.`, "info"));
  return { nextState: next, messages: msgs };
}

export function cmdInventory(state: GameState, msgs: LogMessage[]) {
  msgs.push(
    makeMsg(
      state.inventory.length
        ? "You are carrying: " + state.inventory.map(itemSpan).join(", ")
        : "You have nothing in your inventory.",
      state.inventory.length ? "player" : "info",
    ),
  );
  return { nextState: state, messages: msgs };
}

export function cmdObjectives(state: GameState, msgs: LogMessage[]) {
  msgs.push(makeMsg("📋 <strong>Objectives:</strong>", "system"));
  OBJECTIVES.forEach(({ flag, text }) => {
    const done = !!state.flags[flag];
    msgs.push(
      makeMsg(`${done ? "✅" : "⬜"} ${text}`, done ? "success" : "info"),
    );
  });
  return { nextState: state, messages: msgs };
}

export function cmdHint(state: GameState, msgs: LogMessage[]) {
  msgs.push(makeMsg("💡 <strong>Hint:</strong>", "system"));
  const f = state.flags;
  const hint = !f.has_light
    ? "Take the candle from the foyer before heading east to the kitchen."
    : !f.cauldron_searched
      ? "In the kitchen: use candle on cauldron."
      : !f.stone_moved
        ? "Go down to the basement. Use the chains on the loose stone."
        : !f.black_key_found
          ? "Go north to hallway → west to library (need black key) → north to garden → use witches-broom on grave-marker."
          : !f.library_visited
            ? "You have the black key — head west from the hallway."
            : !f.grave_swept
              ? "Take the broom from the library, go north to garden: use witches-broom on grave-marker."
              : !f.mirror_used
                ? "Get mirror-shard from bathroom, go to hallway: use mirror-shard on portrait."
                : !f.bedroom_entered
                  ? "You have the pumpkin key! Head north from the hallway."
                  : !f.trunk_opened
                    ? "Go up to the attic. Use skull on dusty-trunk."
                    : !f.diary_opened
                      ? "Use rusty-key on locked-diary in the bedroom."
                      : !f.study_entered
                        ? "You have the witch key! Head west from the bedroom."
                        : !f.seal_weakened
                          ? "Use the cursed-amulet in the study."
                          : "Use all four ritual items on the seal: ancient-spellbook, crystal-ball, ghost-lantern, skull.";

  msgs.push(makeMsg(hint, "info"));
  return { nextState: state, messages: msgs };
}

export function cmdQuit(state: GameState, msgs: LogMessage[]) {
  msgs.push(
    makeMsg(
      "🎃 Happy Halloween! Thanks for exploring Hilltop Manor.",
      "system",
    ),
  );
  msgs.push(makeMsg("Refresh the page to play again.", "info"));
  return { nextState: { ...state, isOver: true }, messages: msgs };
}

export function cmdCheat(state: GameState, msgs: LogMessage[]) {
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
    makeMsg(
      "All items, keys and flags set. Head to study → use cursed-amulet → use ancient-spellbook on seal.",
      "success",
    ),
  );
  msgs.push(
    makeMsg("Carrying: " + next.inventory.map(itemSpan).join(", "), "info"),
  );
  return { nextState: next, messages: msgs };
}
