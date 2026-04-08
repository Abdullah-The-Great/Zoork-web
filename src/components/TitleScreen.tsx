import { useState } from "react";

interface Props {
  onStart: () => void;
}

export function TitleScreen({ onStart }: Props) {
  const [showTutorial, setShowTutorial] = useState(false);

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
      <div className="flex gap-4 mt-4">
        <button onClick={onStart} className="btn btn-warning btn-lg">
          ⚰ Begin Adventure
        </button>
        <button
          onClick={() => setShowTutorial((v) => !v)}
          className="btn btn-outline btn-warning"
        >
          ? Tutorial
        </button>
      </div>

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
