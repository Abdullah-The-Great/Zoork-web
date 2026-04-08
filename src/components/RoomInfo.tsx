import { ROOMS } from "../data/rooms";
import type { GameState } from "../types";

export function RoomInfo({ state }: { state: GameState }) {
  const room = ROOMS[state.currentRoom];
  const items = state.roomItems[state.currentRoom];
  const exits = Object.keys(room.passages);

  return (
    <div className="card bg-base-300 border border-orange-950 rounded-xl px-4 py-3 flex flex-row gap-6 flex-wrap text-xs">
      <div>
        <span className="text-orange-500 uppercase tracking-wider">
          Exits:{" "}
        </span>
        <span className="text-slate-300">
          {exits.length ? exits.join(", ") : "none"}
        </span>
      </div>
      <div>
        <span className="text-orange-500 uppercase tracking-wider">
          Items here:{" "}
        </span>
        <span className="text-slate-300">
          {items.length ? items.join(", ") : "nothing"}
        </span>
      </div>
    </div>
  );
}
