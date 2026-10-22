import { getCurrentUser, jsonError } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  return Response.json({ user });
}