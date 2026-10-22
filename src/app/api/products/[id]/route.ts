import { prisma } from "@/lib/prisma";
import { requireUser, jsonError } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const product = await prisma.product.findFirst({ where: { id, userId: user.id } });
    if (!product) return jsonError("Product not found", 404);
    await prisma.product.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e: any) {
    return jsonError(e?.message ?? "Server error", e?.status ?? 500);
  }
}