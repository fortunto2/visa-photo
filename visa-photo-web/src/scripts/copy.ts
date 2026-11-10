// One-tap Copy on the command blocks (`pre.code`) of the skills page, from the shared module
// superduper-tools/shell (cascade, styles, `copy` analytics event).
import { initCopyButtons } from "superduper-tools/shell";

initCopyButtons({
  selector: "pre.code",
  css:
    ".sd-codecopy{--sd-copy-fg:var(--teal);--sd-copy-bg:var(--surface);--sd-copy-bd:var(--teal-line);--sd-copy-accent:var(--teal);--sd-copy-radius:var(--r-pill);--sd-copy-font:var(--ui)}" +
    ".sd-codecopy>.sd-copy-btn{font-weight:700;font-size:14px}",
});
