export type Sub = { code: string; label: string };
export type Area = { code: string; label: string; dept: string; subs: Sub[] };

export const COMMON_SUBS: Sub[] = [
  { code: "price", label: "ราคาและโปรโมชัน" },
  { code: "pay", label: "การชำระเงิน" },
  { code: "front", label: "พนักงานต้อนรับ" },
  { code: "misc", label: "อื่น ๆ" },
];

const RAW: { code: string; label: string; dept: string; subs: Sub[] }[] = [
  {
    code: "gym", label: "ฟิตเนส", dept: "ทีมฟิตเนส",
    subs: [
      { code: "equip", label: "เครื่องออกกำลังกาย" },
      { code: "free", label: "โซน Free weight" },
      { code: "locker", label: "ห้องล็อกเกอร์" },
      { code: "wc", label: "ห้องน้ำ" },
      { code: "clean", label: "ความสะอาด" },
      { code: "ac", label: "เครื่องปรับอากาศ" },
      { code: "crowd", label: "ความหนาแน่น" },
      { code: "staff", label: "พนักงาน" },
    ],
  },
  {
    code: "pt", label: "Personal Trainer", dept: "ทีม Personal Trainer",
    subs: [
      { code: "trainer", label: "ตัวเทรนเนอร์" },
      { code: "appt", label: "การนัดหมาย" },
      { code: "pack", label: "แพ็กเกจและราคา" },
      { code: "result", label: "ผลลัพธ์" },
    ],
  },
  {
    code: "class", label: "คลาสออกกำลังกาย", dept: "ทีมคลาส",
    subs: [
      { code: "name", label: "ชื่อคลาส" },
      { code: "coach", label: "ผู้สอน" },
      { code: "room", label: "ห้องคลาส" },
      { code: "book", label: "การจองและยกเลิก" },
      { code: "sound", label: "เสียงและอุปกรณ์" },
    ],
  },
  {
    code: "pool", label: "สระว่ายน้ำ", dept: "ทีมสระว่ายน้ำ",
    subs: [
      { code: "water", label: "คุณภาพน้ำ" },
      { code: "temp", label: "อุณหภูมิน้ำ" },
      { code: "clean", label: "ความสะอาด" },
      { code: "guard", label: "ไลฟ์การ์ด" },
      { code: "change", label: "ห้องเปลี่ยนชุด" },
      { code: "crowd", label: "ความหนาแน่น" },
    ],
  },
  {
    code: "football", label: "สนามฟุตบอล", dept: "ทีมสนามฟุตบอล",
    subs: [
      { code: "turf", label: "สภาพพื้นสนาม" },
      { code: "light", label: "แสงไฟ" },
      { code: "book", label: "การจองสนาม" },
      { code: "equip", label: "อุปกรณ์" },
      { code: "wc", label: "ห้องน้ำ" },
      { code: "park", label: "ที่จอดรถ" },
    ],
  },
  {
    code: "badminton", label: "สนามแบดมินตัน", dept: "ทีมสนามแบดมินตัน",
    subs: [
      { code: "floor", label: "พื้นสนาม" },
      { code: "light", label: "แสงไฟ" },
      { code: "net", label: "เน็ตและอุปกรณ์" },
      { code: "book", label: "การจองคอร์ต" },
      { code: "air", label: "แอร์และระบายอากาศ" },
    ],
  },
  { code: "other", label: "อื่น ๆ", dept: "ฝ่ายบริการลูกค้า", subs: [] },
];
// ชุดทั่วไปต่อท้ายทุกบริการเสมอ
export const AREAS: Area[] = RAW.map((a) => ({ ...a, subs: [...a.subs, ...COMMON_SUBS] }));

export const areaOf = (code: string) => AREAS.find((a) => a.code === code);
export const subLabel = (area: string, sub: string) =>
  areaOf(area)?.subs.find((s) => s.code === sub)?.label ?? sub;

export const GENDERS = ["M", "F", "O"];
export const CUSTOMER_TYPES = ["GEN", "MEM", "PTN"];
export const AGE_GROUPS = ["lt18", "18_25", "26_35", "36_45", "46_55", "56p"];
export const TYPES = ["problem", "praise", "suggest"];
export const INCIDENT_TIMES = ["now", "today", "yday", "older"];
export const CONSENT_VERSION = 1;

export const STAGES = ["received", "forwarded", "working", "done", "reopened"] as const;
export const STAGE_LABEL: Record<string, string> = {
  received: "รับเรื่องแล้ว",
  forwarded: "ส่งต่อให้ทีมแล้ว",
  working: "กำลังดำเนินการ",
  done: "เสร็จสิ้น",
  reopened: "เปิดเรื่องใหม่",
};
export const TIMELINE_NAMES = ["รับเรื่องแล้ว", "ส่งต่อให้ทีม", "กำลังดำเนินการ", "เสร็จสิ้น"];
