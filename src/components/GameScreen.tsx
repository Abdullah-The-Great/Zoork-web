import { useState } from "react";
import { ROOMS } from "../data/rooms";
import { OutputLog } from "./OutputLog";
import { RoomInfo } from "./RoomInfo";
import { ExitButtons } from "./ExitButtons";
import { InventoryPanel } from "./InventoryPanel";
import { CommandPanel } from "./CommandPanel";
import { MapModal } from "./MapModal";
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
  const [showCheatBox, setShowCheatBox] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [cheatInput, setCheatInput] = useState("");
  const [savedSlot, setSavedSlot] = useState<number | null>(null);

  function handleSave(slot: number) {
    saveGame(slot, state);
    setSavedSlot(slot);
    setTimeout(() => setSavedSlot(null), 2000);
    setShowSavePanel(false);
  }

  function submitCheat() {
    if (!cheatInput.trim()) return;
    onCommand(cheatInput.trim());
    setCheatInput("");
    setShowCheatBox(false);
  }

  return (
    <div className="w-full max-w-3xl flex flex-col gap-3">
      {/* Header */}
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
            onClick={() => setShowMap(true)}
            className="btn btn-xs btn-outline btn-warning"
          >
            🗺 Map
          </button>
          <button
            onClick={() => setShowCheatBox((v) => !v)}
            className="btn btn-xs btn-ghost text-slate-500"
            title="Agent Access"
          >
            🎩
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

      {/* Cheat input box */}
      {showCheatBox && (
        <div className="card bg-base-300 border border-orange-950 rounded-xl px-4 py-3 flex flex-col gap-2">
          <p className="text-slate-500 text-xs uppercase tracking-wider">
            🎩 Agent Access
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={cheatInput}
              onChange={(e) => setCheatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitCheat()}
              placeholder="Enter code..."
              className="input input-bordered input-sm input-warning flex-1 font-mono bg-base-200 text-sm"
              autoFocus
            />
            <button onClick={submitCheat} className="btn btn-sm btn-warning">
              Enter
            </button>
            <button
              onClick={() => {
                setShowCheatBox(false);
                setCheatInput("");
              }}
              className="btn btn-sm btn-ghost text-slate-500"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Save panel */}
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
      <CommandPanel state={state} onCommand={onCommand} />

      {/* Map modal */}
      {showMap && (
        <MapModal
          currentRoom={state.currentRoom}
          visitedRooms={state.visitedRooms ?? []}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  );
}
