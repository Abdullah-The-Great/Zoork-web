import { ROOMS } from "../data/rooms";
import type { GameState } from "../types";

interface Props {
  state: GameState;
  onCommand: (cmd: string) => void;
}

export function ExitButtons({ state, onCommand }: Props) {
  const room = ROOMS[state.currentRoom];

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(room.passages).map(([dir, passage]) => {
        const locked = !!passage.key && !state.inventory.includes(passage.key);
        return (
          <button
            key={dir}
            onClick={() => onCommand(`go ${dir}`)}
            title={locked ? `Requires: ${passage.key}` : `Go ${dir}`}
            className="btn btn-xs btn-outline btn-warning exit-btn"
          >
            {locked ? "🔒 " : ""}
            {dir}
          </button>
        );
      })}
    </div>
  );
}
