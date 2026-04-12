import { useState, useCallback } from "react";
import { TitleScreen } from "./components/TitleScreen";
import { GameScreen } from "./components/GameScreen";
import {
  initGameState,
  processCommand,
  describeRoom,
} from "./engine/GameEngine";
import { autoSave } from "./engine/SaveManager";
import type { GameState, LogMessage } from "./types";

type Screen = "title" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("title");
  const [gameState, setGameState] = useState<GameState>(initGameState());
  const [messages, setMessages] = useState<LogMessage[]>([]);

  function startNewGame() {
    const state = initGameState();
    const intro: LogMessage[] = [
      {
        id: -2,
        html: "🎃 <strong>Welcome to ZOOrk: Halloween at Hilltop Manor!</strong>",
        type: "system",
      },
      { id: -1, html: "<br/>", type: "info" },
      ...describeRoom(state),
    ];
    setGameState(state);
    setMessages(intro);
    setScreen("game");
    autoSave(state);
  }

  function resumeGame(savedState: GameState) {
    const resumeMsgs: LogMessage[] = [
      {
        id: -2,
        html: "🎃 <strong>Welcome back to Hilltop Manor!</strong>",
        type: "system",
      },
      { id: -1, html: "<br/>", type: "info" },
      ...describeRoom(savedState),
    ];
    setGameState(savedState);
    setMessages(resumeMsgs);
    setScreen("game");
  }

  const handleCommand = useCallback((raw: string) => {
    setGameState((prev) => {
      const { nextState, messages: newMsgs } = processCommand(raw, prev);
      setMessages((m) => [...m, ...newMsgs]);
      // auto-save on room change
      if (nextState.currentRoom !== prev.currentRoom) {
        autoSave(nextState);
      }
      return nextState;
    });
  }, []);

  function handleQuitToMenu() {
    setScreen("title");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 gap-4">
      {screen === "title" ? (
        <TitleScreen
          onNewGame={startNewGame}
          onResume={resumeGame}
          onLoad={resumeGame}
        />
      ) : (
        <GameScreen
          state={gameState}
          messages={messages}
          onCommand={handleCommand}
          onQuitToMenu={handleQuitToMenu}
        />
      )}
    </div>
  );
}
