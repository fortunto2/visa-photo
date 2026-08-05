/**
 * Passing a finished photo from the editor to the checker.
 *
 * The two are separate islands on one page, so they cannot share state directly. A module-level
 * slot plus an event is enough and keeps them independent: the editor publishes what it made,
 * the tabs switch, the checker picks it up. Nothing is stored beyond the current page.
 */

const EVENT = "visayes:check-this";
const SLOT = "__visayesHandoff";

/**
 * State lives on `window`, not in this module.
 *
 * The editor and the checker are separate islands, and the bundler gives each its own copy of
 * a module — a variable here would be written in one copy and read from another, which is
 * exactly how the first attempt failed silently.
 */
type Handoff = { blob: Blob; name: string } | null;

declare global {
  interface Window { [SLOT]?: Handoff }
}

export function handOff(blob: Blob, name: string): void {
  (window as any)[SLOT] = { blob, name };
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function takePending(): Handoff {
  const value = ((window as any)[SLOT] ?? null) as Handoff;
  (window as any)[SLOT] = null;
  return value;
}

export function onHandOff(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
