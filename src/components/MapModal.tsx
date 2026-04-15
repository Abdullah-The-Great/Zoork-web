interface Props {
  currentRoom: string;
  visitedRooms: string[];
  onClose: () => void;
}

const ROOM_POSITIONS: Record<string, { x: number; y: number; label: string }> =
  {
    garden: { x: 2, y: 0, label: "Garden" },
    library: { x: 1, y: 1, label: "Library" },
    hallway: { x: 2, y: 1, label: "Hallway" },
    kitchen: { x: 3, y: 1, label: "Kitchen" },
    foyer: { x: 3, y: 2, label: "Foyer" },
    basement: { x: 4, y: 2, label: "Basement" },
    bedroom: { x: 2, y: 2, label: "Bedroom" },
    attic: { x: 2, y: 3, label: "Attic" },
    bathroom: { x: 3, y: 3, label: "Bathroom" },
    study: { x: 1, y: 3, label: "Study" },
  };

const CONNECTIONS = [
  ["garden", "library"],
  ["library", "hallway"],
  ["hallway", "kitchen"],
  ["kitchen", "foyer"],
  ["kitchen", "basement"],
  ["hallway", "bedroom"],
  ["bedroom", "attic"],
  ["bedroom", "bathroom"],
  ["bedroom", "study"],
];

const CELL = 90;
const PAD = 40;

export function MapModal({ currentRoom, visitedRooms, onClose }: Props) {
  const cols = 5;
  const rows = 4;
  const W = cols * CELL + PAD * 2;
  const H = rows * CELL + PAD * 2;

  function cx(x: number) {
    return PAD + x * CELL + CELL / 2;
  }
  function cy(y: number) {
    return PAD + y * CELL + CELL / 2;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="card bg-base-200 border border-orange-900 rounded-2xl p-4 flex flex-col gap-3 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="title-font text-2xl text-orange-500">Hilltop Manor</h2>
          <button
            onClick={onClose}
            className="btn btn-xs btn-ghost text-slate-500"
          >
            ✕ Close
          </button>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full rounded-xl bg-base-300"
          style={{ maxHeight: "360px" }}
        >
          {/* Connection lines */}
          {CONNECTIONS.map(([a, b], i) => {
            const pa = ROOM_POSITIONS[a];
            const pb = ROOM_POSITIONS[b];
            if (!pa || !pb) return null;
            const bothVisited =
              visitedRooms.includes(a) && visitedRooms.includes(b);
            return (
              <line
                key={i}
                x1={cx(pa.x)}
                y1={cy(pa.y)}
                x2={cx(pb.x)}
                y2={cy(pb.y)}
                stroke={bothVisited ? "#ff6b00" : "#333"}
                strokeWidth={bothVisited ? 2 : 1}
                strokeDasharray={bothVisited ? "none" : "4 4"}
              />
            );
          })}

          {/* Room nodes */}
          {Object.entries(ROOM_POSITIONS).map(([id, pos]) => {
            const isCurrent = id === currentRoom;
            const isVisited = visitedRooms.includes(id);
            const fill = isCurrent
              ? "#ff6b00"
              : isVisited
                ? "#3a1a00"
                : "#1a1a1a";
            const stroke = isCurrent
              ? "#ffaa00"
              : isVisited
                ? "#ff6b00"
                : "#333";
            const textColor = isCurrent
              ? "#000"
              : isVisited
                ? "#ff6b00"
                : "#444";

            return (
              <g key={id}>
                <rect
                  x={cx(pos.x) - 34}
                  y={cy(pos.y) - 16}
                  width={68}
                  height={32}
                  rx={6}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isCurrent ? 2 : 1}
                />
                <text
                  x={cx(pos.x)}
                  y={cy(pos.y) + 5}
                  textAnchor="middle"
                  fontSize={10}
                  fill={textColor}
                  fontFamily="monospace"
                >
                  {pos.label}
                </text>
                {isCurrent && (
                  <text
                    x={cx(pos.x)}
                    y={cy(pos.y) - 22}
                    textAnchor="middle"
                    fontSize={12}
                  >
                    🎃
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-slate-400 justify-center">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-orange-500"></span>{" "}
            You are here
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-orange-950 border border-orange-600"></span>{" "}
            Visited
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-neutral border border-neutral-600"></span>{" "}
            Undiscovered
          </span>
        </div>
      </div>
    </div>
  );
}
