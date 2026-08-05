/**
 * The three goals the spec asks for, plus the two that answer the questions those raise.
 *
 * `page_viewed` and `page_engaged` already arrive on their own, so nothing here repeats them.
 * What the counter cannot know by itself is intent: which document someone actually worked on,
 * whether they left with a file, and whether the print sheet is used at all.
 */

type Dimensions = Record<string, string>;
type Metrics = Record<string, number>;

declare global {
  interface Window {
    sda?: ((name: string, dims?: Dimensions, nums?: Metrics) => void) & { q?: unknown[] };
  }
}

/**
 * Never throws and never blocks. An analytics call that can break the photo tool is worse than
 * no analytics: the counter is there to observe the product, not to be a dependency of it.
 */
export function track(name: string, dims?: Dimensions, nums?: Metrics): void {
  try {
    window.sda?.(name, dims, nums);
  } catch {
    /* counting is best-effort */
  }
}

/** Identifies which document page an event happened on. */
export interface DocContext extends Dimensions {
  preset: string;
  country: string;
  doc: string;
}

/** A photo was loaded on a document page — the honest signal of "this country is needed". */
export const trackPresetSelected = (ctx: DocContext, source: "file" | "camera") =>
  track("preset_selected", { ...ctx, source });

/** The goal: someone left with a file. */
export const trackPhotoDownloaded = (ctx: DocContext, format: string, backgroundRemoved: boolean) =>
  track("photo_downloaded", {
    ...ctx,
    format,
    background_removed: String(backgroundRemoved),
  });

/** Whether the print sheet is worth keeping. */
export const trackPrintLayoutUsed = (ctx: DocContext) => track("print_layout_used", ctx);

/** Which model people end up on, and how heavy a download they tolerate. */
export const trackBackgroundRemoved = (ctx: DocContext, model: string, sizeMb: number) =>
  track("background_removed", { ...ctx, model }, { model_mb: sizeMb });

/** Fetched from the models page rather than mid-job. */
export const trackModelDownloaded = (model: string, sizeMb: number) =>
  track("model_downloaded", { model }, { model_mb: sizeMb });
