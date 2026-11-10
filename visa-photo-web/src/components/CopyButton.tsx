import { useState } from "preact/hooks";
import { copyWithMethod, reportCopy } from "superduper-tools/shell";

interface Props {
  /** the text placed on the clipboard */
  payload: string;
  label: string;
  done: string;
  variant?: "primary" | "quiet";
}

/**
 * Copy-to-clipboard with the payload rendered server-side.
 *
 * The text is built during the build from the same data the page shows, so what an agent
 * receives cannot drift from what a human reads two lines above it. The copy is the shared
 * superduper-tools cascade (clipboard API, then execCommand for in-app browsers) and the copy
 * event comes from the same module; a refusal is shown (a warning sign on the label) instead of
 * claiming success.
 */
export default function CopyButton({ payload, label, done, variant = "primary" }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    const { ok, method } = await copyWithMethod(payload);
    setState(ok ? "copied" : "failed");
    reportCopy({
      text: payload,
      kind: "prompt",
      placement: variant,
      slug: location.pathname.split("/").filter(Boolean).pop() ?? "",
      path: location.pathname,
      method,
      ok,
    });
    setTimeout(() => setState("idle"), ok ? 2000 : 4000);
  };

  return (
    <button class={`copy-btn ${variant}`} type="button" onClick={copy}>
      <svg width="18" height="18" aria-hidden="true">
        <use href={state === "copied" ? "#ic-check" : "#ic-copies"} />
      </svg>
      {state === "copied" ? done : state === "failed" ? `⚠ ${label}` : label}
    </button>
  );
}
