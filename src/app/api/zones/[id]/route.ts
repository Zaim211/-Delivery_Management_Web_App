import { prisma } from "@/lib/prisma";
import { requireUser, jsonError } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const zone = await prisma.zone.findFirst({ where: { id, userId: user.id } });
    if (!zone) return jsonError("Zone not found", 404);
    await prisma.zone.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: any) {
    return jsonError(e?.message ?? "Server error", e?.status ?? 500);
  }
}