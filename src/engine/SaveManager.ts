import type { SaveSlot, GameState } from "../types";

const SAVE_KEY = (slot: number) => `zoork_save_${slot}`;
const AUTO_SAVE_KEY = "zoork_autosave";
export const SAVE_SLOTS = [1, 2, 3];

export function saveGame(slot: number, gameState: GameState): void {
  const save: SaveSlot = {
    slot,
    gameState,
    savedAt: new Date().toLocaleString(),
    currentRoom: gameState.currentRoom,
    inventoryCount: gameState.inventory.length,
  };
  localStorage.setItem(SAVE_KEY(slot), JSON.stringify(save));
}

export function loadGame(slot: number): SaveSlot | null {
  const raw = localStorage.getItem(SAVE_KEY(slot));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveSlot;
  } catch {
    return null;
  }
}

export function deleteSave(slot: number): void {
  localStorage.removeItem(SAVE_KEY(slot));
}

export function autoSave(gameState: GameState): void {
  localStorage.setItem(
    AUTO_SAVE_KEY,
    JSON.stringify({
      gameState,
      savedAt: new Date().toLocaleString(),
      currentRoom: gameState.currentRoom,
      inventoryCount: gameState.inventory.length,
    }),
  );
}

export function loadAutoSave(): SaveSlot | null {
  const raw = localStorage.getItem(AUTO_SAVE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SaveSlot;
  } catch {
    return null;
  }
}

export function clearAutoSave(): void {
  localStorage.removeItem(AUTO_SAVE_KEY);
}

export function getAllSaves(): (SaveSlot | null)[] {
  return SAVE_SLOTS.map((slot) => loadGame(slot));
}
