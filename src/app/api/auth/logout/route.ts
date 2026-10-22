import { clearAuthCookie, jsonError } from "@/lib/auth";

export async function POST() {
  try {
    await clearAuthCookie();
    return Response.json({ ok: true });
  } catch {
    return jsonError("Server error", 500);
  }
}