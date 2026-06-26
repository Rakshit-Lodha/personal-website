"use client";

import { useCallback, useEffect, useRef } from "react";
import { useJJSession } from "@/components/jj/JJSessionProvider";
import { useSiteActions } from "@/components/jj/SiteActionProvider";
import type { SiteCommand } from "@/lib/jj/commands";

type RealtimeClientSecret = {
  value: string;
};

type RealtimeSessionResponse = {
  value?: string;
  client_secret?: RealtimeClientSecret;
  error?: string;
};

type RealtimeEvent = {
  type?: string;
  item?: {
    type?: string;
    name?: string;
    call_id?: string;
    arguments?: string;
  };
  delta?: string;
  error?: {
    message?: string;
  };
};

type CommandToolArgs = {
  commands?: SiteCommand[];
};

type RetrievedContext = {
  commandFastPath?: SiteCommand[];
  selected?: Array<{
    suggestedCommands?: SiteCommand[];
  }>;
};

const VISUAL_COMMAND_PRIORITY: SiteCommand["type"][] = [
  "highlight_outcome",
  "focus_project",
  "highlight_project",
  "focus_experience",
  "scroll_to_section",
  "open_music_player",
  "music_play_track",
];

function parseJsonObject<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getEphemeralKey(data: RealtimeSessionResponse): string | null {
  return data.client_secret?.value ?? data.value ?? null;
}

function commandKey(command: SiteCommand): string {
  switch (command.type) {
    case "scroll_to_section":
      return `${command.type}:${command.sectionId}`;
    case "focus_project":
    case "highlight_project":
      return `${command.type}:${command.projectId}`;
    case "open_project_link":
      return `${command.type}:${command.projectId}:${command.linkType}`;
    case "focus_experience":
      return `${command.type}:${command.companyId}`;
    case "highlight_outcome":
      return `${command.type}:${command.outcomeId}`;
    case "music_play_track":
      return `${command.type}:${command.songId}`;
    default:
      return command.type;
  }
}

function pickBestVisualCommand(commands: SiteCommand[]): SiteCommand | null {
  return (
    [...commands]
      .filter((command) => VISUAL_COMMAND_PRIORITY.includes(command.type))
      .sort(
        (a, b) =>
          VISUAL_COMMAND_PRIORITY.indexOf(a.type) - VISUAL_COMMAND_PRIORITY.indexOf(b.type)
      )[0] ?? null
  );
}

function commandsFromRetrievedContext(context: RetrievedContext): SiteCommand[] {
  const commands: SiteCommand[] = [];
  const seen = new Set<string>();

  for (const command of context.commandFastPath ?? []) {
    const key = commandKey(command);
    if (!seen.has(key)) {
      seen.add(key);
      commands.push(command);
    }
  }

  const bestVisual = pickBestVisualCommand(context.selected?.[0]?.suggestedCommands ?? []);
  if (bestVisual) {
    const key = commandKey(bestVisual);
    if (!seen.has(key)) commands.push(bestVisual);
  }

  return commands;
}

export default function JJRealtimeController() {
  const { isActive, setState } = useJJSession();
  const { dispatchSiteCommand } = useSiteActions();
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    dcRef.current?.close();
    pcRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioRef.current?.remove();
    dcRef.current = null;
    pcRef.current = null;
    streamRef.current = null;
    audioRef.current = null;
    setState("idle");
  }, [setState]);

  const setMicMuted = useCallback((muted: boolean) => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }, []);

  const sendFunctionOutput = useCallback((callId: string, output: unknown) => {
    const channel = dcRef.current;
    if (!channel || channel.readyState !== "open") return;
    channel.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify(output),
        },
      })
    );
    channel.send(JSON.stringify({ type: "response.create" }));
  }, []);

  const handleFunctionCall = useCallback(
    (event: RealtimeEvent) => {
      const item = event.item;
      if (!item?.call_id || !item.name) return;

      if (item.name === "retrieve_portfolio_context") {
        const args = parseJsonObject<{ query?: string }>(item.arguments);
        fetch("/api/jj/retrieve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: args?.query ?? "",
            limit: 5,
            rerank: false,
            useEmbeddings: false,
          }),
        })
          .then((response) => response.json())
          .then((context: RetrievedContext) => {
            const commandResults = commandsFromRetrievedContext(context).map((command) =>
              dispatchSiteCommand(command, { explicitUserIntent: false })
            );
            sendFunctionOutput(item.call_id!, { ...context, commandResults });
          })
          .catch((err: unknown) =>
            sendFunctionOutput(item.call_id!, {
              ok: false,
              message: err instanceof Error ? err.message : "Could not retrieve portfolio context",
            })
          );
        return;
      }

      if (item.name === "execute_site_command" || item.name === "control_music") {
        const args = parseJsonObject<CommandToolArgs>(item.arguments);
        const commands = args?.commands ?? [];
        setState("executing");
        const results = commands.map((command) =>
          dispatchSiteCommand(command, { explicitUserIntent: item.name === "execute_site_command" })
        );
        sendFunctionOutput(item.call_id, { results });
        return;
      }

      sendFunctionOutput(item.call_id, { ok: false, message: `Unknown tool: ${item.name}` });
    },
    [dispatchSiteCommand, sendFunctionOutput, setState]
  );

  const handleRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      switch (event.type) {
        case "input_audio_buffer.speech_started":
          setState("listening");
          break;
        case "input_audio_buffer.speech_stopped":
          setState("thinking");
          break;
        case "response.output_audio.delta":
        case "response.output_audio_transcript.delta":
          setState("speaking");
          break;
        case "response.output_item.done":
          if (event.item?.type === "function_call") handleFunctionCall(event);
          break;
        case "response.done":
          setState("listening");
          break;
        case "error":
          setState("error");
          break;
      }
    },
    [handleFunctionCall, setState]
  );

  const start = useCallback(async () => {
    try {
      if (pcRef.current) return;

      setState("thinking");

      const tokenResponse = await fetch("/api/jj/session", { method: "POST" });
      const sessionData = (await tokenResponse.json()) as RealtimeSessionResponse;
      if (!tokenResponse.ok) {
        throw new Error(sessionData.error ?? "Could not create JJ session");
      }

      const ephemeralKey = getEphemeralKey(sessionData);
      if (!ephemeralKey) throw new Error("JJ session did not return a client secret");

      const pc = new RTCPeerConnection();
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audioRef.current = audio;
      pc.ontrack = (event) => {
        audio.srcObject = event.streams[0];
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      pc.addTrack(stream.getTracks()[0]);

      const channel = pc.createDataChannel("oai-events");
      channel.addEventListener("message", (message) => {
        const event = parseJsonObject<RealtimeEvent>(message.data as string);
        if (event) handleRealtimeEvent(event);
      });
      channel.addEventListener("open", () => setState("listening"));

      pcRef.current = pc;
      dcRef.current = channel;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) throw new Error(await sdpResponse.text());

      await pc.setRemoteDescription({
        type: "answer",
        sdp: await sdpResponse.text(),
      });
    } catch {
      stop();
      setState("error");
    }
  }, [handleRealtimeEvent, setState, stop]);

  useEffect(() => {
    if (isActive) {
      void start();
      return;
    }

    stop();
  }, [isActive, start, stop]);

  useEffect(() => {
    const onMute = (event: Event) => {
      setMicMuted(Boolean((event as CustomEvent<{ muted?: boolean }>).detail?.muted));
    };

    window.addEventListener("jj:mic-muted", onMute);
    return () => window.removeEventListener("jj:mic-muted", onMute);
  }, [setMicMuted]);

  return null;
}
