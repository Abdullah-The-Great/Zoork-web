import { ROOMS } from "../data/rooms";
import { ITEM_DESCS } from "../data/items";
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

function itemSpan(name: string) {
  return `<span class="text-orange-400">${name}</span>`;
}

export function initGameState(): GameState {
  const roomItems: Record<string, string[]> = {};
  for (const [id, room] of Object.entries(ROOMS)) {
    roomItems[id] = [...room.items];
  }
  return { currentRoom: "foyer", inventory: [], roomItems, isOver: false };
}

export function describeRoom(state: GameState): LogMessage[] {
  const room = ROOMS[state.currentRoom];
  const msgs: LogMessage[] = [];
  msgs.push(makeMsg(`🕯 <strong>${room.name}</strong>`, "system"));
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
  const next = {
    ...state,
    roomItems: { ...state.roomItems },
    inventory: [...state.inventory],
  };

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
    case "quit":
    case "exit":
      return cmdQuit(next, msgs);
    default:
      msgs.push(
        makeMsg(
          `I don't understand "<span class="text-slate-400">${cmd}</span>". Try: go, look, take, drop, inventory, quit.`,
          "error",
        ),
      );
      return { nextState: next, messages: msgs };
  }
}

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
  msgs.push(makeMsg("<br/>", "info"));
  msgs.push(...describeRoom(next));
  return { nextState: next, messages: msgs };
}

function cmdLook(args: string[], state: GameState, msgs: LogMessage[]) {
  if (!args.length) {
    msgs.push(makeMsg("<br/>", "info"));
    msgs.push(...describeRoom(state));
    return { nextState: state, messages: msgs };
  }
  const itemName = args[0];
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

function cmdTake(args: string[], state: GameState, msgs: LogMessage[]) {
  if (!args.length) {
    msgs.push(makeMsg("Take what?", "error"));
    return { nextState: state, messages: msgs };
  }
  const itemName = args[0];
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
  msgs.push(makeMsg(`You take the ${itemSpan(itemName)}.`, "success"));
  return { nextState: next, messages: msgs };
}

function cmdDrop(args: string[], state: GameState, msgs: LogMessage[]) {
  if (!args.length) {
    msgs.push(makeMsg("Drop what?", "error"));
    return { nextState: state, messages: msgs };
  }
  const itemName = args[0];
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
