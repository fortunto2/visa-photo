import { useEffect, useState } from "preact/hooks";
import { onHandOff } from "../lib/handoff";
import type { ComponentChildren } from "preact";

interface Props {
  makeLabel: string;
  checkLabel: string;
  /** the checker markup, rendered by the page and shown only on that tab */
  check?: ComponentChildren;
  children?: ComponentChildren;
}

/**
 * Two jobs on one page: produce a photo, or judge one that already exists.
 *
 * They share a document, a specification and an audience, so splitting them across two URLs
 * would mean two pages competing for the same search. Making is the default because it is
 * what most arrivals want; checking is one click away for the rest.
 */
export default function ModeTabs({ makeLabel, checkLabel, check, children }: Props) {
  const [mode, setMode] = useState<"make" | "check">("make");

  // The editor finished something and wants it judged; move the visitor there.
  useEffect(() => onHandOff(() => setMode("check")), []);

  return (
    <>
      <div class="mode-tabs" role="tablist" data-testid="mode-tabs">
        <button role="tab" type="button" aria-selected={mode === "make"}
          data-testid="tab-make" onClick={() => setMode("make")}>
          <svg width="17" height="17" aria-hidden="true"><use href="#ic-camera" /></svg>
          {makeLabel}
        </button>
        <button role="tab" type="button" aria-selected={mode === "check"}
          data-testid="tab-check" onClick={() => setMode("check")}>
          <svg width="17" height="17" aria-hidden="true"><use href="#ic-check" /></svg>
          {checkLabel}
        </button>
      </div>

      <div hidden={mode !== "make"}>{children}</div>
      <div hidden={mode !== "check"}>{check}</div>
    </>
  );
}
