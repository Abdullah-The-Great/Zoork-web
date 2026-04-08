import { ROOMS } from "../data/rooms";
import { OutputLog } from "./OutputLog";
import { RoomInfo } from "./RoomInfo";
import { ExitButtons } from "./ExitButtons";
import { InventoryPanel } from "./InventoryPanel";
import { CommandInput } from "./CommandInput";
import type { GameState, LogMessage } from "../types";

interface Props {
  state: GameState;
  messages: LogMessage[];
  onCommand: (cmd: string) => void;
}

export function GameScreen({ state, messages, onCommand }: Props) {
  const room = ROOMS[state.currentRoom];

  return (
    <div className="w-full max-w-3xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="title-font text-3xl text-orange-500">ZOOrk</h1>
        <div className="badge badge-warning badge-outline">{room.name}</div>
      </div>
      <OutputLog messages={messages} />
      <RoomInfo state={state} />
      <ExitButtons state={state} onCommand={onCommand} />
      <InventoryPanel state={state} onCommand={onCommand} />
      <CommandInput disabled={state.isOver} onCommand={onCommand} />
    </div>
  );
}
