import { ROOMS } from "../data/rooms";
import type { GameState, LogMessage } from "../types";
import { makeMsg, makeIntroMessage, itemSpan, hasLight } from "./helpers";
import {
  cmdGo,
  cmdLook,
  cmdTake,
  cmdTakeAll,
  cmdDrop,
  cmdInventory,
  cmdObjectives,
  cmdHint,
  cmdQuit,
  cmdCheat,
} from "./commands";
import { cmdUse, cmdUseOn } from "./puzzles";

export { makeIntroMessage };

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
    visitedRooms: ["foyer"],
    isOver: false,
    won: false,
  };
}

export function describeRoom(state: GameState): LogMessage[] {
  const room = ROOMS[state.currentRoom];
  const msgs: LogMessage[] = [];
  msgs.push(makeMsg(`🕯 <strong>${room.name}</strong>`, "system"));

  if (room.dark && !hasLight(state)) {
    msgs.push(makeMsg("Pitch black. You need a light source.", "error"));
    return msgs;
  }

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

  if ((cmd === "take" || cmd === "get" || cmd === "pick") && args[0] === "all")
    return cmdTakeAll(next, msgs);

  if (cmd === "use") {
    const onIdx = args.indexOf("on");
    if (onIdx !== -1)
      return cmdUseOn(
        args.slice(0, onIdx).join("-"),
        args.slice(onIdx + 1).join("-"),
        next,
        msgs,
      );
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
