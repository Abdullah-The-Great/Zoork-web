import { useState } from "react";
import { ROOMS } from "../data/rooms";
import { OutputLog } from "./OutputLog";
import { RoomInfo } from "./RoomInfo";
import { ExitButtons } from "./ExitButtons";
import { InventoryPanel } from "./InventoryPanel";
import { CommandInput } from "./CommandInput";
import { saveGame, SAVE_SLOTS, loadGame } from "../engine/SaveManager";
import type { GameState, LogMessage } from "../types";

interface Props {
  state: GameState;
  messages: LogMessage[];
  onCommand: (cmd: string) => void;
  onQuitToMenu: () => void;
}

export function GameScreen({
  state,
  messages,
  onCommand,
  onQuitToMenu,
}: Props) {
  const room = ROOMS[state.currentRoom];
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [savedSlot, setSavedSlot] = useState<number | null>(null);

  function handleSave(slot: number) {
    saveGame(slot, state);
    setSavedSlot(slot);
    setTimeout(() => setSavedSlot(null), 2000);
    setShowSavePanel(false);
  }

  return (
    <div className="w-full max-w-3xl flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="title-font text-3xl text-orange-500">ZOOrk</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {savedSlot && (
            <span className="text-green-400 text-xs animate-pulse">
              ✓ Saved to slot {savedSlot}
            </span>
          )}
          {state.won && (
            <span className="text-yellow-400 text-xs animate-bounce">
              🎃 WINNER!
            </span>
          )}
          <div className="badge badge-warning badge-outline">{room.name}</div>
          <button
            onClick={() => onCommand("objectives")}
            className="btn btn-xs btn-outline btn-warning"
          >
            📋 Objectives
          </button>
          <button
            onClick={() => onCommand("hint")}
            className="btn btn-xs btn-outline btn-warning"
          >
            💡 Hint
          </button>
          <button
            onClick={() => setShowSavePanel((v) => !v)}
            className="btn btn-xs btn-outline btn-warning"
          >
            💾 Save
          </button>
          <button
            onClick={onQuitToMenu}
            className="btn btn-xs btn-ghost text-slate-500"
          >
            ✕ Menu
          </button>
        </div>
      </div>

      {showSavePanel && (
        <div className="card bg-base-200 border border-orange-900 rounded-xl px-4 py-3">
          <p className="text-orange-500 text-xs uppercase tracking-wider mb-2">
            Save to slot:
          </p>
          <div className="flex gap-2">
            {SAVE_SLOTS.map((slot) => {
              const existing = loadGame(slot);
              return (
                <button
                  key={slot}
                  onClick={() => handleSave(slot)}
                  className="btn btn-sm btn-outline btn-warning flex-1 flex-col h-auto py-2"
                >
                  <span>Slot {slot}</span>
                  <span className="text-xs text-slate-500 font-normal">
                    {existing ? existing.currentRoom : "empty"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <OutputLog messages={messages} />
      <RoomInfo state={state} />
      <ExitButtons state={state} onCommand={onCommand} />
      <InventoryPanel state={state} onCommand={onCommand} />
      <CommandInput disabled={state.isOver} onCommand={onCommand} />
    </div>
  );
}
