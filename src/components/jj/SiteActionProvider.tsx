"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMusic } from "@/components/music/MusicPlayerProvider";
import { handleSiteCommand, type SiteCommandResult } from "@/lib/jj/commandHandlers";
import type { SiteCommand } from "@/lib/jj/commands";
import type { SurfaceAdapter } from "@/lib/jj/surfaces/types";

type SiteActionContextValue = {
  agentVolume: number;
  dispatchSiteCommand: (
    command: SiteCommand,
    options?: { explicitUserIntent?: boolean }
  ) => SiteCommandResult;
  /**
   * Swap how navigation commands are carried out. `/city` registers its own
   * adapter on mount; unregistering falls back to the scroll site's behaviour.
   * Returns the unregister function.
   */
  registerSurface: (adapter: SurfaceAdapter) => () => void;
};

declare global {
  interface Window {
    __JJ_DISPATCH_SITE_COMMAND__?: (command: SiteCommand) => SiteCommandResult;
  }

  interface WindowEventMap {
    "jj:site-command-result": CustomEvent<{
      command: SiteCommand;
      result: SiteCommandResult;
    }>;
  }
}

const SiteActionContext = createContext<SiteActionContextValue | null>(null);

export function useSiteActions() {
  const value = useContext(SiteActionContext);
  if (!value) throw new Error("useSiteActions must be used inside <SiteActionProvider>");
  return value;
}

export default function SiteActionProvider({ children }: { children: ReactNode }) {
  const music = useMusic();
  const [agentVolume, setAgentVolume] = useState(1);
  const surfaceRef = useRef<SurfaceAdapter | null>(null);

  const registerSurface = useCallback((adapter: SurfaceAdapter) => {
    surfaceRef.current = adapter;
    return () => {
      if (surfaceRef.current === adapter) surfaceRef.current = null;
    };
  }, []);

  const dispatchSiteCommand = useCallback<SiteActionContextValue["dispatchSiteCommand"]>(
    (command, options) => {
      const result = handleSiteCommand(command, {
        music,
        setAgentVolume,
        explicitUserIntent: options?.explicitUserIntent,
        surface: surfaceRef.current ?? undefined,
      });

      window.dispatchEvent(
        new CustomEvent("jj:site-command-result", {
          detail: { command, result },
        })
      );

      return result;
    },
    [music]
  );

  useEffect(() => {
    const onSiteCommand = (event: Event) => {
      const customEvent = event as CustomEvent<SiteCommand>;
      if (customEvent.detail) dispatchSiteCommand(customEvent.detail);
    };

    window.__JJ_DISPATCH_SITE_COMMAND__ = dispatchSiteCommand;
    window.addEventListener("jj:site-command", onSiteCommand);
    return () => {
      window.removeEventListener("jj:site-command", onSiteCommand);
      delete window.__JJ_DISPATCH_SITE_COMMAND__;
    };
  }, [dispatchSiteCommand]);

  const value = useMemo(
    () => ({ agentVolume, dispatchSiteCommand, registerSurface }),
    [agentVolume, dispatchSiteCommand, registerSurface]
  );

  return <SiteActionContext.Provider value={value}>{children}</SiteActionContext.Provider>;
}
