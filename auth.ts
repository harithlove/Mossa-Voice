import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// ใช้ env: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET (Auth.js อ่านเองอัตโนมัติ)
export const { handlers, auth } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    session({ session, token }) {
      // เก็บ Google sub ไว้ใช้ฝั่ง server เท่านั้น (ไม่ส่งออกหน้าเว็บ: /api/me ไม่คืนค่านี้)
      if (session.user) (session.user as { id?: string }).id = token.sub;
      return session;
    },
  },
});
