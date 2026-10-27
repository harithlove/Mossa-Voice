# MOSSA Voice — เว็บฟอร์มรับเสียงลูกค้า (Vercel + Google Login + Google Sheet)

หน้าเว็บ = `public/index.html` ไฟล์เดียวตามสเปก · API = Next.js route handlers ใน `app/api/**` · ล็อกอิน = Auth.js (Google) · ฐานข้อมูล = Google Sheet · ไฟล์แนบ = Vercel Blob (ไม่บังคับ)

รอบแรกตัด LINE/LIFF และโหมดผู้เยี่ยมชมออก: **ต้องล็อกอินด้วย Google ก่อนส่งเรื่อง**

## 1) ตั้งค่า Google (ทำครั้งเดียว)

**ก. OAuth Client สำหรับล็อกอิน**
1. [Google Cloud Console](https://console.cloud.google.com) → สร้าง/เลือกโปรเจกต์ → APIs & Services → OAuth consent screen (External) ใส่ชื่อแอปและอีเมลติดต่อ
2. Credentials → Create credentials → OAuth client ID → *Web application*
3. Authorized redirect URIs เพิ่ม 2 ค่า
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<โดเมนของคุณบน Vercel>/api/auth/callback/google`
4. เก็บ Client ID / Client secret → `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
5. ก่อนเปิดให้คนทั่วไปใช้ ให้กด *Publish app* (ไม่งั้นจำกัดเฉพาะ test users)

**ข. Service Account สำหรับเขียน Google Sheet**
1. เปิดใช้ *Google Sheets API* ในโปรเจกต์เดียวกัน
2. IAM & Admin → Service Accounts → สร้างบัญชี → Keys → Add key → JSON
3. จากไฟล์ JSON: `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `private_key` → `GOOGLE_PRIVATE_KEY`
4. สร้าง Google Sheet เปล่า 1 ไฟล์ → กด Share ให้ `client_email` เป็น **Editor** → เอา ID จาก URL ใส่ `SHEET_ID`
   (แท็บ `Profiles` และ `Tickets` พร้อมหัวตารางจะถูกสร้างให้อัตโนมัติเมื่อมีคนใช้ครั้งแรก)

## 2) Deploy บน Vercel

```bash
npm i -g vercel
cd mossa-voice
npm install
vercel            # ครั้งแรกจะถามสร้างโปรเจกต์
```
แล้วไปที่ Vercel → Project → Settings → Environment Variables ใส่ค่าตาม `.env.example` ทั้งหมด จากนั้น `vercel --prod`

- `AUTH_SECRET`: `openssl rand -base64 32`
- `USER_HASH_SALT`: สตริงสุ่มยาว ๆ **ห้ามเปลี่ยนภายหลัง** (ไม่งั้นระบบจะจำผู้ใช้เดิมไม่ได้)
- แนบรูป/เสียง: Vercel → Storage → Create → Blob แล้วต่อเข้าโปรเจกต์ (จะได้ `BLOB_READ_WRITE_TOKEN` ให้เอง) ถ้าไม่ตั้ง ระบบยังรับเรื่องได้ แต่แนบไฟล์ไม่ได้ (หน้าเว็บจะแจ้งเตือน)
- โลโก้: วางไฟล์ `public/logo.png` (ถ้าไม่มี หน้าเว็บแสดงตัวอักษร MOSSA แทน)
- QR ที่จุดบริการ: `https://<โดเมน>/#pool`, `#gym`, `#pt`, `#class`, `#football`, `#badminton`

รันในเครื่อง: `cp .env.example .env.local` เติมค่า แล้ว `npm run dev`

## 3) ทีมงานทำงานผ่าน Google Sheet

ทุกเรื่องคือ 1 แถวในแท็บ `Tickets` ทีมงานแก้คอลัมน์ได้ตรง ๆ ในชีต ลูกค้าจะเห็นผลในหน้า "เรื่องของฉัน" ทันที

| คอลัมน์ | ทีมงานทำอะไร |
|---|---|
| `stage` | เปลี่ยนค่าเป็น `forwarded` → `working` → `done` (ค่าเริ่มต้นหลังรับเรื่องคือ `forwarded`) เมื่อเป็น `done` ลูกค้าจะเห็นแบบประเมิน |
| `working_at`, `done_at` | ใส่วันเวลา (เช่น `2026-10-28 14:30`) เพื่อแสดงใน timeline (ไม่บังคับ) |
| `staff_note` | บันทึกภายใน ลูกค้าไม่เห็น |
| `escalated` | `TRUE` = เรื่องความปลอดภัย หรือลูกค้าตอบ "ยังไม่แก้" → ผู้จัดการควรดูก่อน (`stage` จะเป็น `reopened`) |

เคล็ดลับ: ใน Google Sheet เลือกคอลัมน์ `stage` → Data → Data validation → Dropdown ใส่ `received, forwarded, working, done, reopened`

ข้อมูลสำหรับวิทยานิพนธ์ (เพศ, ประเภทลูกค้า, ช่วงอายุ) ถูกใส่ไว้ในแถว Ticket โดยตรง พร้อมคอลัมน์ `consent_research` — **ให้กรองเอาเฉพาะ `TRUE` ก่อนนำไปวิเคราะห์**

## 4) ความเป็นส่วนตัว (สิ่งที่โค้ดทำให้)

- ไม่เก็บ Google ID ดิบ: ใช้ SHA-256 + `USER_HASH_SALT` เป็นรหัส `user_key`
- อีเมลถูกบันทึกในชีต **เฉพาะ** เมื่อลูกค้าขอให้ติดต่อกลับและไม่ได้ปิดชื่อ
- "ปิดชื่อต่อทีมงาน": ไม่บันทึกอีเมล และปิดการติดต่อกลับ
- ลูกค้าเห็นเฉพาะเรื่องของตัวเอง (ไม่ใช่เจ้าของ → 404 เหมือนไม่มีเรื่อง)
- คำขอที่แก้ข้อมูลตรวจ same-origin และจำกัดอัตราการส่ง (5 เรื่อง / 10 นาที ต่อผู้ใช้ — แบบ best-effort บน serverless)
- ⚠️ เจ้าของชีตและทุกคนที่แชร์ชีตเห็นข้อมูลทั้งหมดรวมถึงอีเมลผู้ขอติดต่อกลับ → แชร์ให้เฉพาะคนที่จำเป็น
- ⚠️ ไฟล์แนบใน Vercel Blob เป็น URL สาธารณะที่เดาไม่ได้ (ไม่ต้องล็อกอินก็เปิดได้ถ้ามีลิงก์) เหมาะกับงานนี้ แต่ถ้าต้องการเข้มกว่านี้ให้ย้ายไป storage แบบ private

## 5) ข้อจำกัดที่ต่างจากสเปกเดิม

- ไม่มี LINE/LIFF, ไม่มีโหมดผู้เยี่ยมชมและรหัสตรวจสอบ 6 ตัว (ใช้บัญชี Google แทน)
- ไฟล์ละไม่เกิน **4 MB** (Vercel จำกัดคำขอ ~4.5 MB) รูปถูกย่อเป็น JPEG ด้านยาวสุด 1600px ในเบราว์เซอร์ก่อนส่ง และส่งทีละไฟล์
- ข้อมูลเก็บใน Google Sheet เหมาะกับหลักร้อย–หลักพันเรื่อง; Sheets API จำกัดโควตาการอ่าน/เขียนต่อนาที ถ้าเรื่องเยอะหรือใช้พร้อมกันมากควรย้ายไป Postgres
- เลขเรื่อง `MSS-YYYYMMDD-NNNN` นับจากจำนวนแถวของวันนั้น ถ้ามีคนส่งพร้อมกันในเสี้ยววินาทีเดียวกันอาจได้เลขซ้ำได้ยาก แต่ไม่ถึงกับเป็นไปไม่ได้
- ยังไม่มีหน้าจอฝั่งทีมงาน (ใช้ Google Sheet แทน), ไม่ถอดเสียง, ไม่มีภาษาอังกฤษ
- ยังไม่ได้ทดสอบกับ Google OAuth และ Google Sheet จริง (ต้องใช้บัญชีของคุณ)
