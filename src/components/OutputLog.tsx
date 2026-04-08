import { useEffect, useRef } from "react";
import type { LogMessage } from "../types";

const TYPE_CLASS: Record<string, string> = {
  system: "msg-system",
  player: "msg-player",
  error: "msg-error",
  success: "msg-success",
  info: "msg-info",
};

export function OutputLog({ messages }: { messages: LogMessage[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      id="output"
      className="card bg-base-200 border border-orange-900 rounded-xl p-4 h-80 overflow-y-auto flex flex-col gap-1 text-sm"
    >
      {messages.map((msg) => (
        <p
          key={msg.id}
          className={TYPE_CLASS[msg.type] ?? "msg-player"}
          dangerouslySetInnerHTML={{ __html: msg.html }}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
