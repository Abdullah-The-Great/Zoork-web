# 🎃 ZOOrk: Halloween at Hilltop Manor

A Halloween text adventure game ported from a C++ university assignment to a full web app.

**Live Demo:** [zoork-web.vercel.app](https://zoork-web.vercel.app)

---

## 🛠 Stack

|            |                                               |
| ---------- | --------------------------------------------- |
| Runtime    | Deno                                          |
| Bundler    | Vite 5                                        |
| UI         | React 19 + TSX                                |
| Styling    | Tailwind CSS v4 + DaisyUI 5 (halloween theme) |
| Language   | TypeScript                                    |
| Deployment | Vercel                                        |

---

## 🎃 Story

You are a trick-or-treater locked inside Hilltop Manor by the Ghost Witch. Explore 10 haunted rooms, solve puzzles, find hidden keys and collect the four ritual items to break the spell seal in the Study — and claim the Magic Pumpkin Head to escape.

---

## 📁 File Structure

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── types.ts
├── data/
│   ├── rooms.ts          # 10 rooms, passages, locks
│   └── items.ts          # item descriptions, objectives, ritual items
├── engine/
│   ├── GameEngine.ts     # orchestrator, initGameState, describeRoom
│   ├── commands.ts       # go, look, take, drop, hint, objectives, quit
│   ├── puzzles.ts        # use and use-on puzzle logic
│   ├── helpers.ts        # shared utilities
│   └── SaveManager.ts    # localStorage 3-slot save system
└── components/
    ├── TitleScreen.tsx   # new game, resume, load, tutorial
    ├── GameScreen.tsx    # main layout, header, save, map, cheat
    ├── OutputLog.tsx     # message history
    ├── RoomInfo.tsx      # exits and items bar
    ├── ExitButtons.tsx   # direction buttons
    ├── InventoryPanel.tsx
    ├── CommandPanel.tsx  # button-based commands
    └── MapModal.tsx      # SVG manor map
```

---

## 🚀 Running Locally

```bash
git clone https://github.com/Abdullah-The-Great/Zoork-web.git
cd Zoork-web
deno install
deno task dev
```

---

## 👤 Author

**Abdullah Mehboob** — [GitHub](https://github.com/Abdullah-The-Great)
