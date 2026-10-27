import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const err = (status: number, detail: string) =>
  NextResponse.json({ detail }, { status });

export const T = (b: boolean) => (b ? "TRUE" : "FALSE");
export const isT = (s: string | undefined) => s === "TRUE";

export type User = { key: string; email: string };

// ผู้ใช้ที่ล็อกอิน Google แล้ว: ใช้ "รหัสแฮช" แทน Google sub ในทุกที่ (ไม่เก็บ sub ดิบลงชีต)
export async function requireUser(): Promise<User | null> {
  const s = await auth();
  const sub = (s?.user as { id?: string } | undefined)?.id;
  if (!s?.user || !sub) return null;
  const salt = process.env.USER_HASH_SALT || "";
  const key = createHash("sha256").update(salt + ":" + sub).digest("hex").slice(0, 24);
  return { key, email: s.user.email || "" };
}

// ป้องกัน CSRF: คำขอที่แก้ข้อมูลต้องมาจาก origin เดียวกัน
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// จำกัดอัตราแบบง่าย (ต่อ instance ของ serverless — ช่วยกันกดซ้ำ ไม่ใช่การป้องกันขั้นสูง)
const hits = new Map<string, number[]>();
export function rateOk(key: string, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  return true;
}
