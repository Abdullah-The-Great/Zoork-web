import { useState } from "react";
import {
  getAllSaves,
  loadGame,
  deleteSave,
  loadAutoSave,
  SAVE_SLOTS,
} from "../engine/SaveManager";
import type { SaveSlot, GameState } from "../types";
import { ROOMS } from "../data/rooms";

interface Props {
  onNewGame: () => void;
  onResume: (gameState: GameState) => void;
  onLoad: (gameState: GameState) => void;
}

export function TitleScreen({ onNewGame, onResume, onLoad }: Props) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSlots, setShowSlots] = useState(false);
  const [saves, setSaves] = useState<(SaveSlot | null)[]>(getAllSaves);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const autoSave = loadAutoSave();
  const hasAutoSave = !!autoSave;

  function handleResume() {
    if (autoSave) onResume(autoSave.gameState);
  }

  function handleLoad(slot: number) {
    const save = loadGame(slot);
    if (save) onLoad(save.gameState);
  }

  function handleDelete(slot: number) {
    deleteSave(slot);
    setSaves(getAllSaves());
    setConfirmDelete(null);
  }

  const roomName = (roomId: string) => ROOMS[roomId]?.name ?? roomId;

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6 mt-10">
      <h1 className="title-font text-6xl text-orange-500 text-center">ZOOrk</h1>
      <p className="text-orange-300 text-xl tracking-widest text-center">
        Halloween at Hilltop Manor
      </p>

      <div className="divider text-orange-600">🎃</div>

      <p className="text-slate-400 text-center text-sm max-w-md">
        You stand before the iron gates of Hilltop Manor. The wind carries
        whispers of long-forgotten secrets. Will you dare enter?
      </p>

      {/* Main buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={onNewGame} className="btn btn-warning btn-lg w-full">
          ⚰ New Game
        </button>

        <button
          onClick={handleResume}
          disabled={!hasAutoSave}
          className="btn btn-outline btn-warning w-full"
          title={
            hasAutoSave
              ? `Resume from ${autoSave?.currentRoom}`
              : "No session to resume"
          }
        >
          ▶ Resume
          {hasAutoSave && (
            <span className="text-xs text-orange-400 ml-1">
              ({roomName(autoSave!.currentRoom)})
            </span>
          )}
        </button>

        <button
          onClick={() => setShowSlots((v) => !v)}
          className="btn btn-outline btn-warning w-full"
        >
          💾 Load Save
        </button>

        <button
          onClick={() => setShowTutorial((v) => !v)}
          className="btn btn-ghost btn-sm w-full text-slate-500"
        >
          ? How to Play
        </button>
      </div>

      {/* Save slots */}
      {showSlots && (
        <div className="w-full flex flex-col gap-2 mt-2">
          <p className="text-orange-500 text-xs uppercase tracking-wider text-center">
            — Save Slots —
          </p>
          {SAVE_SLOTS.map((slot) => {
            const save = saves[slot - 1];
            return (
              <div
                key={slot}
                className="card bg-base-200 border border-orange-900 rounded-xl px-4 py-3 flex flex-row items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-orange-400 text-xs uppercase tracking-wider">
                    Slot {slot}
                  </span>
                  {save ? (
                    <>
                      <span className="text-slate-200 text-sm font-mono">
                        📍 {roomName(save.currentRoom)}
                      </span>
                      <span className="text-slate-500 text-xs">
                        🎒 {save.inventoryCount} items · {save.savedAt}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-600 text-sm">— empty —</span>
                  )}
                </div>

                <div className="flex gap-2">
                  {save && (
                    <>
                      <button
                        onClick={() => handleLoad(slot)}
                        className="btn btn-xs btn-warning"
                      >
                        Load
                      </button>
                      {confirmDelete === slot ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(slot)}
                            className="btn btn-xs btn-error"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="btn btn-xs btn-ghost"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(slot)}
                          className="btn btn-xs btn-ghost text-slate-500"
                        >
                          🗑
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tutorial */}
      {showTutorial && (
        <div className="card bg-base-200 w-full mt-2 p-4 text-sm text-slate-300 leading-7">
          <p className="text-orange-400 font-bold mb-2">🧙 How to Play</p>
          <p>
            <span className="text-orange-300">go &lt;direction&gt;</span> — Move
            (north, south, east, west, up, down)
          </p>
          <p>
            <span className="text-orange-300">look</span> — Examine your
            surroundings
          </p>
          <p>
            <span className="text-orange-300">look &lt;item&gt;</span> — Inspect
            an item
          </p>
          <p>
            <span className="text-orange-300">take &lt;item&gt;</span> — Pick up
            an item
          </p>
          <p>
            <span className="text-orange-300">drop &lt;item&gt;</span> — Drop an
            item
          </p>
          <p>
            <span className="text-orange-300">inventory</span> — Check your bag
          </p>
          <p>
            <span className="text-orange-300">quit</span> — Leave the manor
          </p>
          <p className="mt-2 text-slate-500">
            🚪 Some doors are locked. Find the right key to pass through.
          </p>
        </div>
      )}
    </div>
  );
}
