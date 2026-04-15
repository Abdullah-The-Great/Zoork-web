import { useState } from "react";
import { ROOMS } from "../data/rooms";
import type { GameState } from "../types";

interface Props {
  state: GameState;
  onCommand: (cmd: string) => void;
}

export function CommandPanel({ state, onCommand }: Props) {
  const [useItem, setUseItem] = useState("");
  const [useTarget, setUseTarget] = useState("");

  const roomItems = state.roomItems[state.currentRoom] ?? [];
  const inventory = state.inventory;
  const exits = Object.keys(ROOMS[state.currentRoom]?.passages ?? {});
  const passages = ROOMS[state.currentRoom]?.passages ?? {};

  const allVisible = [...new Set([...roomItems, ...inventory])];

  if (state.isOver) return null;

  return (
    <div className="card bg-base-300 border border-orange-950 rounded-xl px-4 py-3 flex flex-col gap-3">
      {/* Row 1: Movement */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-orange-500 text-xs uppercase tracking-wider w-10">
          Go
        </span>
        {exits.map((dir) => {
          const locked =
            !!passages[dir]?.key && !inventory.includes(passages[dir].key!);
          return (
            <button
              key={dir}
              onClick={() => onCommand(`go ${dir}`)}
              className="btn btn-xs btn-outline btn-warning"
              title={locked ? `Needs: ${passages[dir].key}` : `Go ${dir}`}
            >
              {locked ? "🔒 " : ""}
              {dir}
            </button>
          );
        })}
        <button
          onClick={() => onCommand("look")}
          className="btn btn-xs btn-outline btn-warning ml-auto"
        >
          🔍 Look
        </button>
        <button
          onClick={() => onCommand("inventory")}
          className="btn btn-xs btn-outline btn-warning"
        >
          🎒 Inv
        </button>
      </div>

      {/* Row 2: Take */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-orange-500 text-xs uppercase tracking-wider w-10">
          Take
        </span>
        {roomItems.length === 0 ? (
          <span className="text-slate-600 text-xs">nothing here</span>
        ) : (
          <>
            {roomItems.map((item) => (
              <button
                key={item}
                onClick={() => onCommand(`take ${item}`)}
                className="btn btn-xs btn-outline btn-success"
              >
                + {item}
              </button>
            ))}
            {roomItems.length > 1 && (
              <button
                onClick={() => onCommand("take all")}
                className="btn btn-xs btn-success"
              >
                + take all
              </button>
            )}
          </>
        )}
      </div>

      {/* Row 3: Drop */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-orange-500 text-xs uppercase tracking-wider w-10">
          Drop
        </span>
        {inventory.length === 0 ? (
          <span className="text-slate-600 text-xs">inventory empty</span>
        ) : (
          inventory.map((item) => (
            <button
              key={item}
              onClick={() => onCommand(`drop ${item}`)}
              className="btn btn-xs btn-outline btn-error"
            >
              - {item}
            </button>
          ))
        )}
      </div>

      {/* Row 4: Look at item */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-orange-500 text-xs uppercase tracking-wider w-10">
          Look
        </span>
        {allVisible.length === 0 ? (
          <span className="text-slate-600 text-xs">nothing to inspect</span>
        ) : (
          allVisible.map((item) => (
            <button
              key={item}
              onClick={() => onCommand(`look ${item}`)}
              className="btn btn-xs btn-ghost text-slate-400"
            >
              🔍 {item}
            </button>
          ))
        )}
      </div>

      {/* Row 5: Use item / Use item on target */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-orange-500 text-xs uppercase tracking-wider w-10">
          Use
        </span>
        <select
          value={useItem}
          onChange={(e) => setUseItem(e.target.value)}
          className="select select-xs select-warning bg-base-200 font-mono"
        >
          <option value="">item...</option>
          {inventory.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <span className="text-slate-500 text-xs">on</span>
        <select
          value={useTarget}
          onChange={(e) => setUseTarget(e.target.value)}
          className="select select-xs select-warning bg-base-200 font-mono"
        >
          <option value="">target... (optional)</option>
          {allVisible.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            if (!useItem) return;
            if (useTarget) {
              onCommand(`use ${useItem} on ${useTarget}`);
            } else {
              onCommand(`use ${useItem}`);
            }
            setUseItem("");
            setUseTarget("");
          }}
          disabled={!useItem}
          className="btn btn-xs btn-warning"
        >
          Use
        </button>
      </div>
    </div>
  );
}
