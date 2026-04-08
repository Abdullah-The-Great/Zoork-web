import { useRef, useEffect, useState } from "react";

interface Props {
  disabled: boolean;
  onCommand: (cmd: string) => void;
}

export function CommandInput({ disabled, onCommand }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    setValue("");
    onCommand(v);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Type a command..."
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          className="input input-bordered input-warning flex-1 font-mono text-sm bg-base-200"
        />
        <button
          onClick={submit}
          disabled={disabled}
          className="btn btn-warning"
        >
          Enter
        </button>
      </div>
      <p className="text-slate-600 text-xs text-center">
        Press Enter to submit. Type{" "}
        <span className="text-orange-700">quit</span> to exit.
      </p>
    </div>
  );
}
