import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";
import { signToken, setAuthCookie, jsonError } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

    const { email, password } = parsed.data;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return jsonError("Email already registered", 409);

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hash },
      select: { id: true, email: true },
    });

    const token = await signToken({ sub: user.id, email: user.email });
    await setAuthCookie(token);
    return Response.json({ user }, { status: 201 });
  } catch (e: any) {
    return jsonError(e?.message ?? "Server error", 500);
  }
}