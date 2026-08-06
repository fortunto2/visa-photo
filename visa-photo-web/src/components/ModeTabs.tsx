import { useEffect, useState } from "preact/hooks";
import { onHandOff } from "../lib/handoff";
import type { ComponentChildren } from "preact";

interface Props {
  makeLabel: string;
  checkLabel: string;
  /** the checker markup, rendered by the page and shown only on that tab */
  check?: ComponentChildren;
  children?: ComponentChildren;
  /** which mode this URL is */
  initial?: "make" | "check";
  makeHref?: string;
  checkHref?: string;
}

/**
 * Two jobs on one page: produce a photo, or judge one that already exists.
 *
 * Each mode has its own URL, because "passport photo checker" is a different search from
 * "passport photo size" and a tab cannot be linked to or ranked. Switching stays instant all
 * the same: the tab swaps the panel and rewrites the address, with no round trip. Back and
 * forward then work the way the address bar promises.
 */
export default function ModeTabs({
  makeLabel, checkLabel, check, children, initial = "make", makeHref, checkHref,
}: Props) {
  const [mode, setMode] = useState<"make" | "check">(initial);

  const go = (next: "make" | "check") => {
    setMode(next);
    const href = next === "check" ? checkHref : makeHref;
    if (href && typeof history !== "undefined") history.pushState({ mode: next }, "", href);
  };

  // The editor finished something and wants it judged; move the visitor there.
  useEffect(() => onHandOff(() => go("check")), []);

  // Someone pressing Back expects the panel to follow the address.
  useEffect(() => {
    const onPop = () => setMode(location.pathname.replace(/\/$/, "").endsWith("/check") ? "check" : "make");
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  return (
    <>
      <div class="mode-tabs" role="tablist" data-testid="mode-tabs">
        <button role="tab" type="button" aria-selected={mode === "make"}
          data-testid="tab-make" onClick={() => go("make")}>
          <svg width="17" height="17" aria-hidden="true"><use href="#ic-camera" /></svg>
          {makeLabel}
        </button>
        <button role="tab" type="button" aria-selected={mode === "check"}
          data-testid="tab-check" onClick={() => go("check")}>
          <svg width="17" height="17" aria-hidden="true"><use href="#ic-check" /></svg>
          {checkLabel}
        </button>
      </div>

      <div hidden={mode !== "make"}>{children}</div>
      <div hidden={mode !== "check"}>{check}</div>
    </>
  );
}
