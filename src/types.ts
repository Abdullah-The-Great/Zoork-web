export interface Passage {
  to: string;
  key?: string;
}

export interface Room {
  name: string;
  desc: string;
  items: string[];
  passages: Record<string, Passage>;
}

export interface GameState {
  currentRoom: string;
  inventory: string[];
  roomItems: Record<string, string[]>;
  isOver: boolean;
}

export type MessageType = "system" | "player" | "error" | "success" | "info";

export interface LogMessage {
  id: number;
  html: string;
  type: MessageType;
}
