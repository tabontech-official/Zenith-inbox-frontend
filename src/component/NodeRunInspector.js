/*
|--------------------------------------------------------------------------
| What happened inside this card
|--------------------------------------------------------------------------
|
| WHY THIS EXISTS
|
| The scenario canvas showed configuration and nothing else. When a lead
| came out on the wrong template there was no way to ask the obvious
| question — "what did the Router actually see?" — from the screen the
| question occurs on. The run history had a flat list of sentences, which
| tells you a step failed but not what value it failed on.
|
| So every card carries the operations it performed on the selected run,
| and opening one shows the INPUT it was given and the OUTPUT it decided.
| A wrong answer is then a matter of reading two values rather than
| reasoning about the engine.
|
| Modelled on Make's module inspector, which is the interaction the
| operator already knows: a count on the card, click it, see the bundle.
*/

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Check, X, Minus, Search } from "lucide-react";

/* ---------------------------------------------------------------- helpers */

const typeLabel = (value) => {
  if (Array.isArray(value)) return "Array";
  if (value === null) return "Null";
  if (value === undefined) return "Empty";
  if (typeof value === "object") return "Collection";
  if (typeof value === "boolean") return "Boolean";
  if (typeof value === "number") return "Number";
  if (typeof value === "string")
    return value.length > 80 ? "Long String" : "String";
  return typeof value;
};

const isBranch = (value) =>
  value !== null && typeof value === "object" && Object.keys(value).length > 0;

/*
 * A value the operator can act on.
 *
 * Booleans are the verdicts (matched, passed, usedFallback) and carry the
 * most meaning per pixel, so they are coloured rather than printed as the
 * word "true". Empty strings are called out — an empty value is usually
 * the cause, and rendering nothing hides it.
 */
const Scalar = ({ value }) => {
  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
          value
            ? "bg-emerald-50 text-emerald-700"
            : "bg-rose-50 text-rose-700"
        }`}
      >
        {value ? <Check size={10} /> : <X size={10} />}
        {String(value)}
      </span>
    );
  }

  if (value === null || value === undefined || value === "") {
    return <span className="text-[11px] italic text-slate-400">empty</span>;
  }

  return (
    <span className="whitespace-pre-wrap break-words text-[11px] text-slate-700">
      {String(value)}
    </span>
  );
};

/*
 * The collapsible tree. Depth 0–1 start open because the answer is almost
 * always one or two levels in; deeper nesting stays folded so a long
 * conditions array does not push the verdict off-screen.
 */
const TreeNode = ({ label, value, depth = 0, filter = "" }) => {
  const [open, setOpen] = useState(depth < 2);

  const branch = isBranch(value);

  const matchesFilter = useMemo(() => {
    if (!filter) return true;
    const needle = filter.toLowerCase();
    if (String(label).toLowerCase().includes(needle)) return true;
    try {
      return JSON.stringify(value ?? "").toLowerCase().includes(needle);
    } catch {
      return false;
    }
  }, [filter, label, value]);

  if (!matchesFilter) return null;

  if (!branch) {
    return (
      <div
        className="flex items-start gap-2 py-[3px]"
        style={{ paddingLeft: depth * 14 }}
      >
        <Minus size={10} className="mt-1 shrink-0 text-slate-300" />
        <span className="shrink-0 text-[11px] font-semibold text-slate-600">
          {label}:
        </span>
        <Scalar value={value} />
      </div>
    );
  }

  const entries = Array.isArray(value)
    ? value.map((v, i) => [`Item ${i + 1}`, v])
    : Object.entries(value);

  return (
    <div style={{ paddingLeft: depth * 14 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded py-[3px] text-left hover:bg-slate-50"
      >
        {open ? (
          <ChevronDown size={12} className="shrink-0 text-slate-400" />
        ) : (
          <ChevronRight size={12} className="shrink-0 text-slate-400" />
        )}
        <span className="text-[11px] font-bold text-[#5B5FD6]">{label}</span>
        <span className="text-[10px] text-slate-400">({typeLabel(value)})</span>
        {!open && (
          <span className="text-[10px] text-slate-400">
            {entries.length} field{entries.length === 1 ? "" : "s"}
          </span>
        )}
      </button>

      {open &&
        entries.map(([k, v]) => (
          <TreeNode
            key={k}
            label={k}
            value={v}
            depth={depth + 1}
            filter={filter}
          />
        ))}
    </div>
  );
};

const STATUS_STYLE = {
  success: { dot: "bg-emerald-500", text: "text-emerald-700", chip: "bg-emerald-50" },
  failed: { dot: "bg-rose-500", text: "text-rose-700", chip: "bg-rose-50" },
  skipped: { dot: "bg-slate-400", text: "text-slate-600", chip: "bg-slate-100" },
  pending: { dot: "bg-amber-400", text: "text-amber-700", chip: "bg-amber-50" },
};

const statusOf = (s) => STATUS_STYLE[s] || STATUS_STYLE.pending;

/* ------------------------------------------------------- one operation */

export const OperationBlock = ({ step, index, filter = "", defaultOpen }) => {
  const [open, setOpen] = useState(
    defaultOpen ?? step?.status === "failed",
  );
  const st = statusOf(step?.status);

  const hasInput = isBranch(step?.input);
  const hasOutput = isBranch(step?.output);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-50"
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${st.dot}`} />
        <span className="text-xs font-bold text-slate-800">
          Operation {index + 1}
        </span>
        <span className="truncate text-[11px] text-slate-500">
          {step?.stepName}
        </span>
        <span
          className={`ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${st.chip} ${st.text}`}
        >
          {step?.status}
        </span>
        {open ? (
          <ChevronDown size={13} className="shrink-0 text-slate-400" />
        ) : (
          <ChevronRight size={13} className="shrink-0 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-100 px-3 py-3">
          {step?.message && (
            <p className="text-[11px] leading-relaxed text-slate-700">
              {step.message}
            </p>
          )}

          {step?.issue && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-2">
              <p className="text-[11px] font-semibold text-rose-800">
                {step.issue}
              </p>
              {step?.suggestion && (
                <p className="mt-1 text-[11px] leading-relaxed text-rose-700">
                  {step.suggestion}
                </p>
              )}
            </div>
          )}

          {hasInput && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Input
              </p>
              <div className="rounded-lg bg-slate-50/70 p-2">
                {Object.entries(step.input).map(([k, v]) => (
                  <TreeNode key={k} label={k} value={v} filter={filter} />
                ))}
              </div>
            </div>
          )}

          {hasOutput && (
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Output
              </p>
              <div className="rounded-lg bg-[#F8FAFF] p-2">
                {Object.entries(step.output).map(([k, v]) => (
                  <TreeNode key={k} label={k} value={v} filter={filter} />
                ))}
              </div>
            </div>
          )}

          {!hasInput && !hasOutput && (
            <p className="text-[11px] italic text-slate-400">
              This step recorded no input or output.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/* --------------------------------------------------------------- badge */

/*
 * The count on the card. Absent rather than zero when the node did
 * nothing on this run — a "0" badge reads as a failure, and "did not run"
 * is not a failure.
 */
export const NodeRunBadge = ({ steps = [], onClick }) => {
  if (!steps.length) return null;

  const failed = steps.some((s) => s.status === "failed");
  const skipped = !failed && steps.every((s) => s.status === "skipped");

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={`${steps.length} operation${steps.length === 1 ? "" : "s"} on the selected run — click to inspect`}
      className={`absolute -top-2.5 -right-2.5 z-10 flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold shadow-sm transition hover:shadow-md ${
        failed
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : skipped
            ? "border-slate-200 bg-slate-50 text-slate-600"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {failed ? <X size={11} /> : <Check size={11} />}
      {steps.length}
    </button>
  );
};

/* --------------------------------------------------------------- modal */

export const NodeRunModal = ({ title, subtitle, steps = [], onClose }) => {
  const [filter, setFilter] = useState("");

  const failed = steps.filter((s) => s.status === "failed").length;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/50 p-4 pt-16 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#E0E7FF] bg-white shadow-2xl"
      >
        <div className="border-b border-[#E0E7FF] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900">
                {title}
              </h3>
              {subtitle && (
                <p className="truncate text-[11px] text-slate-500">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
              {steps.length} operation{steps.length === 1 ? "" : "s"}
            </span>
            {failed > 0 && (
              <span className="rounded-md bg-rose-50 px-2 py-0.5 font-semibold text-rose-700">
                {failed} failed
              </span>
            )}
          </div>

          <div className="relative mt-2.5">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search inputs and outputs"
              className="w-full rounded-lg border border-slate-200 py-1.5 pl-7 pr-2 text-[11px] outline-none focus:border-[#7375E8]"
            />
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50/60 p-3">
          {steps.length === 0 ? (
            <p className="px-1 py-6 text-center text-[11px] text-slate-500">
              This card performed no operations on the selected run.
            </p>
          ) : (
            steps.map((step, i) => (
              <OperationBlock
                key={`${step.stepKey}-${i}`}
                step={step}
                index={i}
                filter={filter}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/*
 * Steps grouped by the card that produced them.
 *
 * Steps written before nodeId existed, and any the engine forgets to
 * label, fall into "unassigned" so they stay visible in history rather
 * than disappearing from a view that only knows about known nodes.
 */
export const groupStepsByNode = (steps = []) => {
  const byNode = {};

  (steps || []).forEach((step) => {
    const key = step?.nodeId || "unassigned";
    if (!byNode[key]) byNode[key] = [];
    byNode[key].push(step);
  });

  return byNode;
};

export default NodeRunModal;
