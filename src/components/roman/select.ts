/** JJ asks for a chapter or project; the section that owns that state listens and expands it. */
const EVENT = "roman:select";
type Kind = "experience" | "project";
type Detail = { kind: Kind; id: string };

export function emitSelect(kind: Kind, id: string) {
  window.dispatchEvent(new CustomEvent<Detail>(EVENT, { detail: { kind, id } }));
}

export function onSelect(kind: Kind, handler: (id: string) => void) {
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<Detail>).detail;
    if (detail.kind === kind) handler(detail.id);
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
