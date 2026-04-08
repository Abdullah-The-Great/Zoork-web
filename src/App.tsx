import { useState, useCallback } from "react";
import { TitleScreen } from "./components/TitleScreen";
import { GameScreen } from "./components/GameScreen";
import {
  initGameState,
  processCommand,
  describeRoom,
} from "./engine/GameEngine";
import type { GameState, LogMessage } from "./types";

export default function App() {
  const [screen, setScreen] = useState<"title" | "game">("title");
  const [gameState, setGameState] = useState<GameState>(initGameState());
  const [messages, setMessages] = useState<LogMessage[]>([]);

  const handleStart = useCallback(() => {
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
  }, []);

  const handleCommand = useCallback((raw: string) => {
    setGameState((prev) => {
      const { nextState, messages: newMsgs } = processCommand(raw, prev);
      setMessages((m) => [...m, ...newMsgs]);
      return nextState;
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 gap-4">
      {screen === "title" ? (
        <TitleScreen onStart={handleStart} />
      ) : (
        <GameScreen
          state={gameState}
          messages={messages}
          onCommand={handleCommand}
        />
      )}
    </div>
  );
}
