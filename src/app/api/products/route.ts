import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";
import { requireUser, jsonError } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireUser();
    const products = await prisma.product.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        zones: { include: { zone: { select: { id: true, name: true } } } },
        _count: { select: { orders: true } },
      },
    });
    return Response.json({ products });
  } catch (e: any) {
    return jsonError(e?.message ?? "Server error", e?.status ?? 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

    const { name, price, quantity, zoneIds } = parsed.data;

    // Verify all provided zones belong to this user
    if (zoneIds.length > 0) {
      const owned = await prisma.zone.findMany({
        where: { id: { in: zoneIds }, userId: user.id },
        select: { id: true },
      });
      if (owned.length !== zoneIds.length) return jsonError("Invalid zone");
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        quantity,
        userId: user.id,
        zones: {
          create: zoneIds.map((zoneId) => ({ zoneId })),
        },
      },
      include: { zones: { include: { zone: true } } },
    });
    return Response.json({ product }, { status: 201 });
  } catch (e: any) {
    return jsonError(e?.message ?? "Server error", e?.status ?? 500);
  }
}