import type { GameState, LogMessage, MessageType } from "../types";

let _msgId = 0;

export function makeMsg(html: string, type: MessageType): LogMessage {
  return { id: _msgId++, html, type };
}

export function makeIntroMessage(
  html: string,
  type: MessageType = "system",
): LogMessage {
  return makeMsg(html, type);
}

export function itemSpan(name: string) {
  return `<span class="text-orange-400">${name}</span>`;
}

export function hasItem(state: GameState, item: string): boolean {
  return state.inventory.includes(item);
}

export function hasLight(state: GameState): boolean {
  return (
    hasItem(state, "candle") ||
    hasItem(state, "ghost-lantern") ||
    hasItem(state, "lantern")
  );
}
