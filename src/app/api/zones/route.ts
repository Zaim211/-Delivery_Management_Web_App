import { prisma } from "@/lib/prisma";
import { zoneSchema } from "@/lib/validation";
import { requireUser, jsonError } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const zones = await prisma.zone.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { products: true, orders: true } } },
    });
    return Response.json({ zones });
  } catch (e: any) {
    return jsonError(e?.message ?? "Server error", e?.status ?? 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = zoneSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

    const zone = await prisma.zone.create({
      data: { ...parsed.data, userId: user.id },
    });
    return Response.json({ zone }, { status: 201 });
  } catch (e: any) {
    return jsonError(e?.message ?? "Server error", e?.status ?? 500);
  }
}