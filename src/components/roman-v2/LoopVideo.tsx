"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useSyncExternalStore, type Ref } from "react";
import { motionClip, type MotionClip } from "@/lib/roman-v2/motion";
import { useCardActive } from "./CardActivity";
import s from "./LoopVideo.module.css";

/*
 * Motion layer for a Roman v2 still. Render it as the last child of the element that holds the still's <img>
 * (directly, or inside a <picture>); it covers that box, fades a muted video in over the still once the video is
 * playing, then hides the still so moving parts never ghost over it. Two stacked <video>s double-buffer clip
 * changes, so a clip that ends on a frame hands over to the next without a flash.
 *
 * Nothing is fetched before window load + an idle slot (the hero LCP image is in by then), IntroReveal finishing,
 * and the layer being within ~1 viewport; it plays only while on screen and the tab is visible. Reduced motion,
 * Save-Data and 2G/3G connections render no video at all. A clip id missing from the manifest leaves the still alone.
 */

type Connection = { saveData?: boolean; effectiveType?: string; addEventListener?: (type: "change", cb: () => void) => void; removeEventListener?: (type: "change", cb: () => void) => void };
const connection = () => (navigator as Navigator & { connection?: Connection }).connection;
const REDUCED = "(prefers-reduced-motion: reduce)";

/** Video is allowed: no reduced motion, no Save-Data, not a 2G/3G connection. */
export function motionAllowed() {
  const c = connection();
  return !matchMedia(REDUCED).matches && !c?.saveData && !/2g|3g/.test(c?.effectiveType ?? "");
}

function subscribeAllowed(cb: () => void) {
  const mq = matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  connection()?.addEventListener?.("change", cb);
  return () => {
    mq.removeEventListener("change", cb);
    connection()?.removeEventListener?.("change", cb);
  };
}

/** Client-only (false while server rendering and hydrating), so markup always matches the still-only HTML. */
export function useMotionAllowed() {
  return useSyncExternalStore(subscribeAllowed, motionAllowed, () => false);
}

let pageReady: Promise<void> | undefined;
/** Window load (every eager image, the hero LCP included, is in), then an idle slot. */
function whenPageReady() {
  return (pageReady ??= new Promise((resolve) => {
    const idle = () => (typeof requestIdleCallback === "function" ? requestIdleCallback(() => resolve(), { timeout: 2000 }) : setTimeout(resolve, 200));
    if (document.readyState === "complete") idle();
    else addEventListener("load", idle, { once: true });
  }));
}

/**
 * IntroReveal (src/components/IntroReveal.tsx) locks body scrolling for its whole run and restores it in the same
 * call that unmounts it, so "body overflow is no longer hidden" means the reveal has finished (or was skipped).
 */
function whenIntroRevealDone() {
  return new Promise<void>((resolve) => {
    const done = () => document.body.style.overflow !== "hidden";
    if (done()) return resolve();
    const observer = new MutationObserver(() => {
      if (!done()) return;
      observer.disconnect();
      resolve();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
  });
}

/**
 * Alpha needs the right codec per engine. WebKit (Safari, and every browser on iOS, which all use WebKit) composites
 * alpha only from HEVC-with-alpha MP4 (`hvc1`): it decodes VP9 WebM but drops the alpha plane. Chromium and Firefox
 * composite alpha only from VP9 WebM; Chromium can decode hvc1 in hardware but drops alpha there too. canPlayType
 * alone can't tell these apart (both say "probably"), hence the engine check. The check uses `userAgentData`,
 * which only Chromium exposes, so Chrome emulating an iPhone (DevTools device mode) still counts as Chromium.
 * Opaque clips take any playable source.
 */
function pickSource(clip: MotionClip) {
  const probe = document.createElement("video");
  const webkit = /AppleWebKit/.test(navigator.userAgent) && !("userAgentData" in navigator);
  const alphaType = webkit ? /^video\/mp4.*hvc1/ : /^video\/webm/;
  const playable = (type: string) => probe.canPlayType(type) !== "";
  return (
    clip.sources.find((source) => alphaType.test(source.type) && playable(source.type)) ??
    (clip.alpha ? undefined : clip.sources.find((source) => playable(source.type)))
  );
}

/** `${base}-mobile` / `${base}-desktop` for the device, else the bare id. */
function resolveClip(base: string | undefined, mobile: boolean) {
  if (!base) return undefined;
  return (motionClip(`${base}-${mobile ? "mobile" : "desktop"}`) ?? motionClip(base))?.id;
}

const once = (el: HTMLVideoElement, type: string) =>
  new Promise<boolean>((resolve) => {
    const done = (event: Event) => {
      el.removeEventListener(type, done);
      el.removeEventListener("error", done);
      resolve(event.type === type);
    };
    el.addEventListener(type, done);
    el.addEventListener("error", done);
  });

export type PlayOptions = {
  rate?: number;
  loop?: boolean;
  /** Crossfade in ms; 0 is a hard cut, for clips that start on the frame now showing. */
  fade?: number;
  /** Show the clip's last frame, paused, instead of playing it. */
  hold?: boolean;
};

export type MotionHandle = {
  /** Resolves when a one-shot clip ends, or once a loop or held frame is showing; false if it can't play. */
  play(id: string, options?: PlayOptions): Promise<boolean>;
  /** Changes the rate of the clip now playing. */
  setRate(rate: number): void;
  /** Fades back to the still. */
  still(): void;
};

function createEngine(host: HTMLElement, videos: HTMLVideoElement[], startRatio = 0, onShow?: (video: HTMLVideoElement) => void) {
  const stillImg = host.parentElement?.querySelector<HTMLImageElement>(":scope > picture > img, :scope > img");
  let front = videos[0];
  let z = 1;
  let near = false;
  let inView = false;
  let started = false;
  let active = true;
  let waiters: (() => void)[] = [];
  let resolveArmed!: () => void;
  const armed = new Promise<void>((resolve) => (resolveArmed = resolve));

  const gateOpen = () => active && inView && document.visibilityState === "visible";
  const sync = () => {
    if (gateOpen()) {
      waiters.forEach((wake) => wake());
      waiters = [];
      if (front.dataset.on !== undefined && front.dataset.hold === undefined && !front.ended) front.play().catch(() => {});
    } else front.pause();
  };
  const waitGate = () => new Promise<void>((resolve) => (gateOpen() ? resolve() : waiters.push(resolve)));

  const nearObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || near) return;
    near = true;
    nearObserver.disconnect();
    // Nothing loads under IntroReveal's overlay: it covers the page, and the hero must not start beneath it.
    whenPageReady().then(whenIntroRevealDone).then(resolveArmed);
  }, { rootMargin: "100% 0px" });
  const viewObserver = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting && (started || entry.intersectionRatio >= startRatio);
      sync();
    },
    { threshold: startRatio ? [0, startRatio] : 0 }
  );
  nearObserver.observe(host);
  viewObserver.observe(host);
  document.addEventListener("visibilitychange", sync);

  const show = (next: HTMLVideoElement, fade: number) => {
    const prev = front;
    front = next;
    next.style.zIndex = String(++z);
    next.style.transitionDuration = `${fade}ms`;
    next.dataset.on = "";
    const settle = () => {
      if (front !== next) return;
      if (stillImg) stillImg.style.visibility = "hidden";
      if (prev !== next) {
        delete prev.dataset.on;
        prev.pause();
      }
      onShow?.(next);
    };
    if (fade) setTimeout(settle, fade);
    else requestAnimationFrame(settle);
  };

  const handle: MotionHandle = {
    async play(id, { rate = 1, loop = false, fade = 300, hold = false } = {}) {
      const clip = motionClip(id);
      const source = clip && pickSource(clip);
      if (!source) return false;
      await armed;
      // Replaying what's already up (a hold-and-repeat loop) reuses it; anything else loads in the back buffer.
      const reuse = front.dataset.clip === id && front.dataset.on !== undefined && !hold;
      const next = reuse ? front : videos.find((video) => video !== front)!;
      if (hold) next.preload = "auto";
      if (next.dataset.clip !== id) {
        next.dataset.clip = id;
        next.src = source.src;
      }
      next.loop = loop;
      next.defaultPlaybackRate = next.playbackRate = rate;
      if (hold) {
        next.dataset.hold = "";
        if (next.readyState < 1 && !(await once(next, "loadedmetadata"))) return false;
        next.currentTime = Math.max(0, next.duration - 0.05);
        if (!(await once(next, "seeked"))) return false;
        await waitGate();
      } else {
        delete next.dataset.hold;
        if (next.readyState >= 1) next.currentTime = 0;
        await waitGate();
        started = true;
        try {
          await next.play();
        } catch {
          return false; // autoplay refused (e.g. iOS Low Power Mode): keep the still
        }
      }
      if (!reuse) show(next, fade);
      return loop || hold || next.ended || once(next, "ended");
    },
    setRate(rate) {
      front.playbackRate = rate;
    },
    still() {
      if (stillImg) stillImg.style.visibility = "";
      for (const video of videos) {
        video.style.transitionDuration = "200ms";
        delete video.dataset.on;
        video.pause();
      }
    },
  };

  const destroy = () => {
    nearObserver.disconnect();
    viewObserver.disconnect();
    document.removeEventListener("visibilitychange", sync);
    if (stillImg) stillImg.style.visibility = "";
    for (const video of videos) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  };

  /** Extra gate (e.g. hover): when off, playback holds on the current frame (the still, before the first play). */
  const setActive = (next: boolean) => {
    active = next;
    sync();
  };

  return { handle, destroy, setActive };
}

type Sequence = {
  /** Clip id (or `-desktop`/`-mobile` base) played once before the loop. */
  intro?: string;
  /** Clip id (or base) looped after the intro. */
  loop?: string;
  /** The intro plays once per browser session (later views go straight to the loop). */
  rememberIntro?: boolean;
  /** Visible fraction needed for the first play (later plays need any visibility). */
  startRatio?: number;
  /** Pause on the loop's last frame for this long between plays instead of looping seamlessly. */
  holdMs?: number;
  /** Plays only while true (default), on top of the in-view and tab-visible gates. */
  active?: boolean;
};

type Props = Sequence & {
  /** Media query that picks the `-mobile` clip; match the section's <picture> breakpoint. */
  mobileQuery?: string;
  className?: string;
  /** Imperative control (career); omit intro/loop to drive it only through the handle. */
  ref?: Ref<MotionHandle | null>;
  /** Called once the player exists, i.e. motion is allowed and the handle works. */
  onReady?: () => void;
  /** Called with the <video> once a clip has faded in over the still (e.g. to follow its playback time). */
  onShow?: (video: HTMLVideoElement) => void;
};

function Player({ intro, loop, rememberIntro, startRatio, holdMs, active = true, className, ref, onReady, onShow }: Omit<Props, "mobileQuery">) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);
  const onReadyRef = useRef(onReady);
  const onShowRef = useRef(onShow);
  useEffect(() => {
    onShowRef.current = onShow;
  }, [onShow]);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
    engineRef.current?.setActive(active);
  }, [active]);

  useImperativeHandle(
    ref,
    () => ({
      play: (id, options) => engineRef.current?.handle.play(id, options) ?? Promise.resolve(false),
      setRate: (rate) => engineRef.current?.handle.setRate(rate),
      still: () => engineRef.current?.handle.still(),
    }),
    []
  );

  useEffect(() => {
    const host = hostRef.current!;
    const engine = createEngine(host, [...host.querySelectorAll("video")], startRatio, (video) => onShowRef.current?.(video));
    engine.setActive(activeRef.current);
    engineRef.current = engine;
    onReadyRef.current?.();
    let alive = true;

    (async () => {
      const { play } = engine.handle;
      let played = false;
      if (intro) {
        const key = `roman-v2-motion:${intro}`;
        let seen = false;
        try {
          seen = rememberIntro === true && sessionStorage.getItem(key) === "1";
        } catch {}
        // Marked once it has played through, so an unmount mid-intro (or Strict Mode's double mount) doesn't skip it.
        played = !seen && (await play(intro));
        try {
          if (played && rememberIntro) sessionStorage.setItem(key, "1");
        } catch {}
      }
      if (!loop || !alive) return;
      // Hard cut from the intro's last frame; fade in over the still otherwise.
      const fade = played ? 0 : 300;
      if (!holdMs) return void play(loop, { loop: true, fade });
      while (alive && (await play(loop, { fade }))) await new Promise((wait) => setTimeout(wait, holdMs));
    })();

    return () => {
      alive = false;
      engine.destroy();
      engineRef.current = null;
    };
  }, [intro, loop, rememberIntro, startRatio, holdMs]);

  return (
    <span ref={hostRef} className={className ? `${s.host} ${className}` : s.host} aria-hidden="true">
      <video muted playsInline preload="none" disablePictureInPicture disableRemotePlayback tabIndex={-1} />
      <video muted playsInline preload="none" disablePictureInPicture disableRemotePlayback tabIndex={-1} />
    </span>
  );
}

export default function LoopVideo({ mobileQuery, intro, loop, active, ...rest }: Props) {
  const allowed = useMotionAllowed();
  // Inside a CardActivity (Beyond Work) the clip plays only while its card is active.
  const cardActive = useCardActive();
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!mobileQuery) return () => {};
      const mq = matchMedia(mobileQuery);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [mobileQuery]
  );
  const mobile = useSyncExternalStore(subscribe, () => (mobileQuery ? matchMedia(mobileQuery).matches : false), () => false);
  const introId = resolveClip(intro, mobile);
  const loopId = resolveClip(loop, mobile);
  const imperative = !intro && !loop;

  if (!allowed || (!imperative && !introId && !loopId)) return null;
  // A breakpoint change swaps the still's crop, so restart on the matching clips.
  return <Player key={String(mobile)} intro={introId} loop={loopId} active={active ?? cardActive ?? true} {...rest} />;
}
