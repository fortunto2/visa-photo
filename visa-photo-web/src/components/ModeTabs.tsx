import { useEffect } from "preact/hooks";
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
  makeHref: string;
  checkHref: string;
}

/**
 * Two jobs, two addresses.
 *
 * These were client-side tabs that rewrote the URL as they switched, which looked instant and
 * was wrong: the heading, the description and the sections below are rendered per URL, so
 * after a click the address said "checker" while the page still said "photo size". Only a
 * reload put them back in agreement.
 *
 * Links instead. A static page over a CDN arrives in about the time the swap took, and now
 * everything on it matches the address — including the title, which is what a shared link
 * shows and what a search result shows.
 */
export default function ModeTabs({
  makeLabel, checkLabel, check, children, initial = "make", makeHref, checkHref,
}: Props) {
  // The editor finished something and wants it judged: take them to the checker's own page.
  useEffect(() => onHandOff(() => { location.href = checkHref; }), [checkHref]);

  return (
    <>
      <div class="mode-tabs" role="tablist" data-testid="mode-tabs">
        <a role="tab" href={makeHref} aria-selected={initial === "make"} data-testid="tab-make">
          <svg width="17" height="17" aria-hidden="true"><use href="#ic-camera" /></svg>
          {makeLabel}
        </a>
        <a role="tab" href={checkHref} aria-selected={initial === "check"} data-testid="tab-check">
          <svg width="17" height="17" aria-hidden="true"><use href="#ic-check" /></svg>
          {checkLabel}
        </a>
      </div>

      <div hidden={initial !== "make"}>{children}</div>
      <div hidden={initial !== "check"}>{check}</div>
    </>
  );
}
