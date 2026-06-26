"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { JJTurnState } from "@/lib/jj/voiceTypes";

type JJSessionMode = "fullscreen" | "docked";

type JJSessionContextValue = {
  isActive: boolean;
  mode: JJSessionMode;
  state: JJTurnState;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setMode: (mode: JJSessionMode) => void;
  setState: (state: JJTurnState) => void;
};

const JJSessionContext = createContext<JJSessionContextValue | null>(null);

export function useJJSession() {
  const value = useContext(JJSessionContext);
  if (!value) throw new Error("useJJSession must be used inside <JJSessionProvider>");
  return value;
}

export default function JJSessionProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<JJSessionMode>("fullscreen");
  const [state, setState] = useState<JJTurnState>("idle");
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback(() => {
    triggerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setMode("fullscreen");
    setState("listening");
    setIsActive(true);
  }, []);

  const close = useCallback(() => {
    setIsActive(false);
    setMode("fullscreen");
    setState("idle");
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const toggle = useCallback(() => {
    if (isActive) {
      close();
      return;
    }
    open();
  }, [close, isActive, open]);

  const value = useMemo(
    () => ({
      isActive,
      mode,
      state,
      open,
      close,
      toggle,
      setMode,
      setState,
    }),
    [close, isActive, mode, open, state, toggle]
  );

  return <JJSessionContext.Provider value={value}>{children}</JJSessionContext.Provider>;
}
