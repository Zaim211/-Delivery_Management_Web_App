import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { signToken, setAuthCookie, jsonError } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid email or password");

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return jsonError("Invalid email or password", 401);

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return jsonError("Invalid email or password", 401);

    const token = await signToken({ sub: user.id, email: user.email });
    await setAuthCookie(token);
    return Response.json({ user: { id: user.id, email: user.email } });
  } catch {
    return jsonError("Server error", 500);
  }
}