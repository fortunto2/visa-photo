import { useEffect, useState } from "preact/hooks";
import {
  MODELS,
  ensureModel,
  cachedModelIds,
  removeModel,
  getPreferredModel,
  setPreferredModel,
  type BgModel,
} from "../lib/background";
import { trackModelDownloaded } from "../lib/analytics";

export interface TableStrings {
  model: string;
  size: string;
  bestFor: string;
  status: string;
  downloaded: string;
  notDownloaded: string;
  download: string;
  downloading: string;
  remove: string;
  makeDefault: string;
  isDefault: string;
  mb: string;
}

interface Props {
  strings: TableStrings;
  /** id → prose, written per locale */
  bestFor: Record<string, string>;
}

type Row = { cached: boolean; progress: number | null };

/**
 * The models table, but operable.
 *
 * It first shipped read-only — five rows saying "Not yet" and no way to change that, which is
 * a settings page that settles nothing. Each row can now fetch its model ahead of time, drop
 * it again, and be made the one the background button starts with.
 */
export default function ModelTable({ strings, bestFor }: Props) {
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [preferred, setPreferred] = useState<string>(MODELS[0].id);

  useEffect(() => {
    let alive = true;
    setPreferred(getPreferredModel().id);
    // One key read for all five, rather than five full-buffer reads.
    cachedModelIds().then((ids) => {
      if (!alive) return;
      setRows(Object.fromEntries(MODELS.map((m) => [m.id, { cached: ids.has(m.id), progress: null }])));
    });
    return () => {
      alive = false;
    };
  }, []);

  const patch = (id: string, next: Partial<Row>) =>
    setRows((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { cached: false, progress: null }), ...next } }));

  const fetchModel = async (model: BgModel) => {
    patch(model.id, { progress: 0 });
    try {
      await ensureModel(model, (loaded, total) =>
        patch(model.id, { progress: total ? Math.round((loaded / total) * 100) : 0 }),
      );
      patch(model.id, { cached: true, progress: null });
      trackModelDownloaded(model.id, model.sizeMb);
    } catch {
      patch(model.id, { progress: null });
    }
  };

  const drop = async (model: BgModel) => {
    await removeModel(model.id);
    patch(model.id, { cached: false, progress: null });
  };

  const choose = (model: BgModel) => {
    setPreferredModel(model.id);
    setPreferred(model.id);
  };

  return (
    <div class="table-wrap">
      <table class="models-table">
        <thead>
          <tr>
            <th>{strings.model}</th>
            <th>{strings.size}</th>
            <th>{strings.bestFor}</th>
            <th>{strings.status}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {MODELS.map((model) => {
            const row = rows[model.id];
            const busy = row?.progress !== null && row?.progress !== undefined;
            const isDefault = preferred === model.id;

            return (
              <tr key={model.id} class={isDefault ? "is-default" : undefined}>
                <td class="model-cell">
                  {model.name}
                  {isDefault && <em class="badge">{strings.isDefault}</em>}
                </td>
                <td class="num">{model.sizeMb} {strings.mb}</td>
                <td>{bestFor[model.id] ?? ""}</td>
                <td>
                  {busy ? (
                    <span class="status is-busy">{strings.downloading} {row!.progress}%</span>
                  ) : row?.cached ? (
                    <span class="status is-yes">
                      <svg width="15" height="15" aria-hidden="true"><use href="#ic-check" /></svg>
                      {strings.downloaded}
                    </span>
                  ) : (
                    <span class="status is-no">{row ? strings.notDownloaded : "…"}</span>
                  )}
                </td>
                <td class="row-actions">
                  {!row?.cached && !busy && (
                    <button class="mini" type="button" onClick={() => fetchModel(model)}>
                      <svg width="15" height="15"><use href="#ic-download" /></svg>
                      {strings.download}
                    </button>
                  )}
                  {row?.cached && !isDefault && (
                    <button class="mini primary" type="button" onClick={() => choose(model)}>
                      {strings.makeDefault}
                    </button>
                  )}
                  {row?.cached && (
                    <button class="mini quiet" type="button" onClick={() => drop(model)}>
                      {strings.remove}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
