export interface Passage {
  to: string;
  key?: string;
}

export interface Room {
  name: string;
  desc: string;
  items: string[];
  passages: Record<string, Passage>;
  dark?: boolean;
}

export interface GameState {
  currentRoom: string;
  inventory: string[];
  roomItems: Record<string, string[]>;
  flags: Record<string, boolean>;
  isOver: boolean;
  won: boolean;
}

export type MessageType = "system" | "player" | "error" | "success" | "info";

export interface LogMessage {
  id: number;
  html: string;
  type: MessageType;
}

export interface SaveSlot {
  slot: number;
  gameState: GameState;
  savedAt: string;
  currentRoom: string;
  inventoryCount: number;
}
export interface GameState {
  currentRoom: string;
  inventory: string[];
  roomItems: Record<string, string[]>;
  flags: Record<string, boolean>;
  visitedRooms: string[];
  isOver: boolean;
  won: boolean;
}
