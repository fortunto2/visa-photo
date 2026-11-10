import { useState } from "preact/hooks";
import { copyText } from "superduper-tools/shell";

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
 * receives cannot drift from what a human reads two lines above it. The copy itself is the
 * superduper-tools cascade (clipboard API, then execCommand for in-app browsers); a refusal is
 * shown (a warning sign on the label) instead of claiming success.
 */
export default function CopyButton({ payload, label, done, variant = "primary" }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    const ok = await copyText(payload);
    setState(ok ? "copied" : "failed");
    if (ok) (window as unknown as { sda?: (n: string, p?: Record<string, string>) => void }).sda?.("code_copied", { path: location.pathname, placement: variant });
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
