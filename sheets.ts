import { google, sheets_v4 } from "googleapis";

export const PROFILE_COLS = [
  "user_key", "gender", "customer_type", "age_group", "regular_services",
  "consent_service", "consent_research", "consent_callback", "consent_version",
  "created_at", "updated_at",
] as const;

export const TICKET_COLS = [
  "ticket_id", "created_at", "user_key", "type", "service_area", "sub_area", "text",
  "entry_point", "incident_time", "safety_flag", "anonymous_to_staff", "callback_wanted",
  "contact", "gender", "customer_type", "age_group", "consent_research", "assigned_dept",
  "stage", "forwarded_at", "working_at", "done_at", "escalated",
  "survey_resolved", "csat", "response_speed", "nps", "survey_comment",
  "attachments", "staff_note",
] as const;

const TABS = { Profiles: PROFILE_COLS, Tickets: TICKET_COLS } as const;
export type Tab = keyof typeof TABS;
// ค่าทุกช่องเป็นสตริง (ยกเว้น _row = เลขแถวในชีต)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = { _row: number } & Record<string, any>;

let _client: sheets_v4.Sheets | null = null;
function client() {
  if (_client) return _client;
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  _client = google.sheets({ version: "v4", auth });
  return _client;
}
const sheetId = () => {
  const id = process.env.SHEET_ID;
  if (!id) throw new Error("SHEET_ID is not set");
  return id;
};

function colLetter(n: number) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// สร้างแท็บและหัวตารางให้อัตโนมัติครั้งแรก
let ready: Promise<void> | null = null;
export function ensureSheets() {
  if (!ready) {
    ready = (async () => {
      const api = client();
      const meta = await api.spreadsheets.get({ spreadsheetId: sheetId() });
      const have = new Set(meta.data.sheets?.map((s) => s.properties?.title));
      const missing = (Object.keys(TABS) as Tab[]).filter((t) => !have.has(t));
      if (missing.length) {
        await api.spreadsheets.batchUpdate({
          spreadsheetId: sheetId(),
          requestBody: { requests: missing.map((title) => ({ addSheet: { properties: { title } } })) },
        });
      }
      for (const tab of Object.keys(TABS) as Tab[]) {
        const cols = TABS[tab];
        const r = await api.spreadsheets.values.get({
          spreadsheetId: sheetId(),
          range: `${tab}!A1:${colLetter(cols.length)}1`,
        });
        if (!r.data.values?.[0]?.length) {
          await api.spreadsheets.values.update({
            spreadsheetId: sheetId(),
            range: `${tab}!A1`,
            valueInputOption: "RAW",
            requestBody: { values: [[...cols]] },
          });
        }
      }
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

export async function readAll(tab: Tab): Promise<Row[]> {
  await ensureSheets();
  const cols = TABS[tab];
  const r = await client().spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: `${tab}!A2:${colLetter(cols.length)}`,
  });
  return (r.data.values ?? []).map((v, i) => {
    const o: Record<string, string> = {};
    cols.forEach((c, j) => (o[c] = v[j] == null ? "" : String(v[j])));
    return { ...o, _row: i + 2 } as Row;
  });
}

type Cells = Record<string, string | number>;
const toValues = (tab: Tab, o: Cells) => [TABS[tab].map((c) => String(o[c] ?? ""))];

export async function appendRow(tab: Tab, o: Cells) {
  await ensureSheets();
  await client().spreadsheets.values.append({
    spreadsheetId: sheetId(),
    range: `${tab}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: toValues(tab, o) },
  });
}

export async function updateRow(tab: Tab, row: number, o: Cells) {
  await ensureSheets();
  await client().spreadsheets.values.update({
    spreadsheetId: sheetId(),
    range: `${tab}!A${row}`,
    valueInputOption: "RAW",
    requestBody: { values: toValues(tab, o) },
  });
}
