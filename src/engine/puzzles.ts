import { ROOMS } from "../data/rooms";
import { RITUAL_ITEMS } from "../data/items";
import type { GameState, LogMessage } from "../types";
import { makeMsg, itemSpan, hasItem, hasLight } from "./helpers";
import { cmdHint } from "./commands";

export function cmdUse(item: string, state: GameState, msgs: LogMessage[]) {
  if (!hasItem(state, item)) {
    msgs.push(makeMsg(`You don't have a ${itemSpan(item)}.`, "error"));
    return { nextState: state, messages: msgs };
  }

  const next = {
    ...state,
    flags: { ...state.flags },
    roomItems: Object.fromEntries(
      Object.entries(state.roomItems).map(([k, v]) => [k, [...v]]),
    ),
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
          "You gaze into the crystal ball... A vision: <em>a lantern glowing green beneath a loose stone in the basement.</em>",
          "system",
        ),
      );
      break;
    case "potion-bottle":
      msgs.push(
        makeMsg(
          "You drink the potion. A voice whispers your objectives:",
          "system",
        ),
      );
      return cmdHint(next, msgs);
    case "ragged-doll":
      msgs.push(
        makeMsg(
          "The doll's arm slowly rises and points toward the dusty trunk.",
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
          "The statue's eyes glow and its paw points downward — toward the basement.",
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
            "You hold the amulet toward the seal. It CRACKS. The seal is weakened!",
            "success",
          ),
        );
        next.flags.seal_weakened = true;
      }
      break;
    case "quill-pen":
      msgs.push(
        makeMsg(
          "You write on the wall: 'I was here.' Probably not helpful.",
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
      msgs.push(makeMsg(`Try: use ${item} on <target>.`, "info"));
  }

  return { nextState: next, messages: msgs };
}

export function cmdUseOn(
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
    inventory: [...state.inventory],
    roomItems: Object.fromEntries(
      Object.entries(state.roomItems).map(([k, v]) => [k, [...v]]),
    ),
  };

  const currentItems = state.roomItems[state.currentRoom] ?? [];
  const inRoom = (t: string) => currentItems.includes(t);
  const addItem = (i: string) => {
    next.roomItems[next.currentRoom] = [...next.roomItems[next.currentRoom], i];
  };
  const remItem = (i: string) => {
    next.roomItems[next.currentRoom] = next.roomItems[next.currentRoom].filter(
      (x) => x !== i,
    );
  };

  switch (`${item}|${target}`) {
    case "candle|cauldron":
      if (!inRoom("cauldron")) {
        msgs.push(makeMsg("No cauldron here.", "error"));
        break;
      }
      if (next.flags.cauldron_searched) {
        msgs.push(makeMsg("Already searched.", "info"));
        break;
      }
      msgs.push(
        makeMsg(
          "You lower the candle into the cauldron. Something glints at the bottom...",
          "system",
        ),
      );
      msgs.push(
        makeMsg(
          `An ${itemSpan("orange-key")} rises to the surface!`,
          "success",
        ),
      );
      addItem("orange-key");
      next.flags.cauldron_searched = true;
      next.flags.orange_key_found = true;
      break;

    case "witches-broom|grave-marker":
      if (!inRoom("grave-marker")) {
        msgs.push(makeMsg("No grave marker here.", "error"));
        break;
      }
      if (next.flags.grave_swept) {
        msgs.push(makeMsg("Already swept.", "info"));
        break;
      }
      msgs.push(
        makeMsg(
          "You sweep the dirt from the grave. The earth shifts...",
          "system",
        ),
      );
      msgs.push(
        makeMsg(`A ${itemSpan("black-key")} was buried beneath!`, "success"),
      );
      addItem("black-key");
      next.flags.grave_swept = true;
      next.flags.black_key_found = true;
      break;

    case "mirror-shard|portrait":
      if (!inRoom("portrait")) {
        msgs.push(makeMsg("No portrait here.", "error"));
        break;
      }
      if (next.flags.mirror_used) {
        msgs.push(makeMsg("Already revealed.", "info"));
        break;
      }
      msgs.push(
        makeMsg(
          "You angle the mirror toward the portrait. Light hits the frame — a hidden compartment springs open!",
          "system",
        ),
      );
      msgs.push(makeMsg(`A ${itemSpan("pumpkin-key")} falls out!`, "success"));
      addItem("pumpkin-key");
      next.flags.mirror_used = true;
      break;

    case "chains|loose-stone":
      if (!inRoom("loose-stone")) {
        msgs.push(makeMsg("No loose stone here.", "error"));
        break;
      }
      if (next.flags.stone_moved) {
        msgs.push(makeMsg("Already moved.", "info"));
        break;
      }
      if (ROOMS[next.currentRoom].dark && !hasLight(next)) {
        msgs.push(makeMsg("Too dark.", "error"));
        break;
      }
      msgs.push(
        makeMsg(
          "You loop the chains around the stone and pull. A hidden cavity is revealed!",
          "system",
        ),
      );
      msgs.push(
        makeMsg(
          `You find a ${itemSpan("ghost-lantern")} and a ${itemSpan("skull")}!`,
          "success",
        ),
      );
      remItem("loose-stone");
      addItem("ghost-lantern");
      addItem("skull");
      next.flags.stone_moved = true;
      break;

    case "rusty-key|locked-diary":
      if (!inRoom("locked-diary") && !hasItem(state, "locked-diary")) {
        msgs.push(makeMsg("No locked diary here.", "error"));
        break;
      }
      if (next.flags.diary_opened) {
        msgs.push(makeMsg("Already opened.", "info"));
        break;
      }
      msgs.push(
        makeMsg(
          "The key clicks. The diary opens. Inside: a witch-key and a note: <em>'The four sacred items will break the seal.'</em>",
          "system",
        ),
      );
      msgs.push(
        makeMsg(`A ${itemSpan("witch-key")} was hidden inside!`, "success"),
      );
      next.roomItems[next.currentRoom] = next.roomItems[
        next.currentRoom
      ].filter((x) => x !== "locked-diary");
      next.inventory = next.inventory.filter((x) => x !== "locked-diary");
      addItem("witch-key");
      next.flags.diary_opened = true;
      break;

    case "skull|dusty-trunk":
      if (!inRoom("dusty-trunk")) {
        msgs.push(makeMsg("No trunk here.", "error"));
        break;
      }
      if (next.flags.trunk_opened) {
        msgs.push(makeMsg("Already opened.", "info"));
        break;
      }
      msgs.push(
        makeMsg(
          "You press the skull to the lock. The symbols align — the trunk flies open!",
          "system",
        ),
      );
      msgs.push(makeMsg(`Inside: a ${itemSpan("rusty-key")}!`, "success"));
      remItem("dusty-trunk");
      addItem("rusty-key");
      next.flags.trunk_opened = true;
      break;

    case "ancient-spellbook|seal":
    case "crystal-ball|seal":
    case "ghost-lantern|seal":
    case "skull|seal": {
      if (next.currentRoom !== "study") {
        msgs.push(makeMsg("No seal here.", "error"));
        break;
      }
      if (!next.flags.seal_weakened) {
        msgs.push(
          makeMsg(
            "The seal is too strong. Weaken it with the cursed-amulet first.",
            "error",
          ),
        );
        break;
      }
      const missing = RITUAL_ITEMS.filter((r) => !hasItem(next, r));
      if (missing.length) {
        msgs.push(
          makeMsg(`Still need: ${missing.map(itemSpan).join(", ")}`, "error"),
        );
        break;
      }
      msgs.push(makeMsg("⚡ The ritual items SURGE with power!", "system"));
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
          "You broke the Ghost Witch's curse! The manor fades as dawn breaks. You are free.",
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
