import { Row } from "./sheets";
import { STAGE_LABEL, TIMELINE_NAMES, areaOf, subLabel } from "./config";

const stageIdx = (s: string) => ({ received: 0, forwarded: 1, working: 2, done: 3, reopened: 1 } as Record<string, number>)[s] ?? 1;

export const surveyDone = (r: Row) => !!r.survey_resolved;
export const surveyOpen = (r: Row) => r.stage === "done" && !surveyDone(r);

export function listItem(r: Row) {
  return {
    ticket_id: r.ticket_id,
    type: r.type,
    service_label: areaOf(r.service_area)?.label ?? r.service_area,
    sub_label: subLabel(r.service_area, r.sub_area),
    stage: r.stage,
    status: STAGE_LABEL[r.stage] ?? r.stage,
    created_at: r.created_at,
    survey_open: surveyOpen(r),
  };
}

export function detail(r: Row) {
  const idx = stageIdx(r.stage);
  const done = r.stage === "done";
  const ats = [r.created_at, r.forwarded_at, r.working_at, r.done_at];
  return {
    ...listItem(r),
    timeline: TIMELINE_NAMES.map((name, i) => ({
      name,
      state: done || i < idx ? "ok" : i === idx ? "now" : "pending",
      at: ats[i] || null,
    })),
    survey_done: surveyDone(r),
  };
}
