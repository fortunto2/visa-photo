import { useState } from "preact/hooks";

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
 * receives cannot drift from what a human reads two lines above it.
 */
export default function CopyButton({ payload, label, done, variant = "primary" }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      // Older browsers and non-secure contexts have no clipboard API.
      const area = document.createElement("textarea");
      area.value = payload;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button class={`copy-btn ${variant}`} type="button" onClick={copy}>
      <svg width="18" height="18" aria-hidden="true">
        <use href={copied ? "#ic-check" : "#ic-copies"} />
      </svg>
      {copied ? done : label}
    </button>
  );
}
