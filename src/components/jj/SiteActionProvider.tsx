"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMusic } from "@/components/music/MusicPlayerProvider";
import { handleSiteCommand, type SiteCommandResult } from "@/lib/jj/commandHandlers";
import type { SiteCommand } from "@/lib/jj/commands";

type SiteActionContextValue = {
  agentVolume: number;
  dispatchSiteCommand: (
    command: SiteCommand,
    options?: { explicitUserIntent?: boolean }
  ) => SiteCommandResult;
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

  const dispatchSiteCommand = useCallback<SiteActionContextValue["dispatchSiteCommand"]>(
    (command, options) => {
      const result = handleSiteCommand(command, {
        music,
        setAgentVolume,
        explicitUserIntent: options?.explicitUserIntent,
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
    () => ({ agentVolume, dispatchSiteCommand }),
    [agentVolume, dispatchSiteCommand]
  );

  return <SiteActionContext.Provider value={value}>{children}</SiteActionContext.Provider>;
}
