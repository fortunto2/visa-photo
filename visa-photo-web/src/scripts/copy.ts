// One-tap Copy on the command blocks (`pre.code`) of the skills page. Mechanics live in superduper-tools/shell.
import { attachCodeCopy } from "superduper-tools/shell";

attachCodeCopy({
  selector: "pre.code",
  onCopied: () =>
    (window as unknown as { sda?: (n: string, p?: Record<string, string>) => void }).sda?.("code_copied", {
      path: location.pathname,
      placement: "block",
    }),
  css:
    ".sd-codecopy{--sd-copy-fg:var(--teal);--sd-copy-bg:var(--surface);--sd-copy-bd:var(--teal-line);--sd-copy-accent:var(--teal)}" +
    ".sd-codecopy>.sd-copy-btn{font-family:var(--ui);font-weight:700;font-size:14px;border-radius:var(--r-pill)}",
});
