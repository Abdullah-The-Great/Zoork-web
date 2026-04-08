import { ITEM_DESCS } from "../data/items";
import type { GameState } from "../types";

interface Props {
  state: GameState;
  onCommand: (cmd: string) => void;
}

export function InventoryPanel({ state, onCommand }: Props) {
  return (
    <div className="card bg-base-300 border border-orange-950 rounded-xl px-4 py-2">
      <span className="text-orange-500 text-xs uppercase tracking-wider">
        🎒 Inventory:
      </span>
      <div className="flex flex-wrap gap-1 mt-1">
        {state.inventory.length === 0 ? (
          <span className="text-slate-600 text-xs">empty</span>
        ) : (
          state.inventory.map((item) => (
            <div
              key={item}
              className="badge badge-outline badge-warning badge-sm cursor-pointer hover:badge-warning"
              title={ITEM_DESCS[item] ?? ""}
              onClick={() => onCommand(`look ${item}`)}
            >
              {item}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
