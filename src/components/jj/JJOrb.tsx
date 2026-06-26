import styles from "./JJOrb.module.css";
import type { CSSProperties } from "react";

export type JJOrbState = "idle" | "speaking";

type JJOrbProps = {
  size: number;
  state?: JJOrbState;
  withRings?: boolean;
  className?: string;
};

export default function JJOrb({
  size,
  state = "idle",
  withRings = false,
  className,
}: JJOrbProps) {
  const classNames = [
    styles.shell,
    state === "speaking" ? styles.speaking : "",
    withRings ? styles.fullscreen : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classNames}
      data-state={state}
      data-with-rings={withRings}
      style={{ "--jj-orb-size": `${size}px` } as CSSProperties}
      aria-hidden="true"
    >
      {withRings && (
        <>
          <span className={styles.fullscreenRing} />
          <span className={`${styles.fullscreenRing} ${styles.ringTwo}`} />
          <span className={`${styles.fullscreenRing} ${styles.ringThree}`} />
        </>
      )}
      {!withRings && <span className={styles.orbRing} />}
      <span className={styles.orb} data-testid="jj-orb-core" />
    </div>
  );
}
