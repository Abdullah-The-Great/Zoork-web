import { useState } from "react";
import { ITEM_DESCS } from "../data/items";
import type { GameState } from "../types";

interface Props {
  state: GameState;
  onCommand: (cmd: string) => void;
}

export function InventoryPanel({ state, onCommand }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card bg-base-300 border border-orange-950 rounded-xl px-4 py-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full"
      >
        <span className="text-orange-500 text-xs uppercase tracking-wider">
          🎒 Inventory
          {state.inventory.length > 0 && (
            <span className="ml-2 badge badge-warning badge-xs">
              {state.inventory.length}
            </span>
          )}
        </span>
        <span className="text-slate-500 text-xs">
          {open ? "▲ hide" : "▼ show"}
        </span>
      </button>

      {open && (
        <div className="mt-2 flex flex-wrap gap-2">
          {state.inventory.length === 0 ? (
            <span className="text-slate-600 text-xs">
              Your inventory is empty.
            </span>
          ) : (
            state.inventory.map((item) => (
              <div
                key={item}
                className="flex items-center gap-1 bg-base-200 rounded-lg px-2 py-1 border border-orange-950"
              >
                <button
                  onClick={() => onCommand(`look ${item}`)}
                  className="text-orange-400 text-xs font-mono hover:text-orange-300"
                  title={ITEM_DESCS[item] ?? ""}
                >
                  {item}
                </button>
                <button
                  onClick={() => onCommand(`drop ${item}`)}
                  className="text-slate-600 hover:text-red-400 text-xs ml-1"
                  title={`Drop ${item}`}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
