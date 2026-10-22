import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/lib/validation";
import { requireUser, jsonError } from "@/lib/auth";
import { haversineMeters } from "@/lib/haversine";

export async function GET() {
  try {
    const user = await requireUser();
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, price: true } },
        zone: { select: { id: true, name: true } },
      },
    });
    return Response.json({ orders });
  } catch (e: any) {
    return jsonError(e?.message ?? "Server error", e?.status ?? 500);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid input");

    const { productId, quantity, customerLat, customerLng, address } = parsed.data;

    // 1. Product must belong to this user
    const product = await prisma.product.findFirst({
      where: { id: productId, userId: user.id },
    });
    if (!product) return jsonError("Product not found", 404);

    // 2. Stock check
    if (quantity > product.quantity) {
      return jsonError(
        `Not enough stock: only ${product.quantity} left`,
        409
      );
    }

    // 3. Find which of this user's zones contains the customer point.
    //    Include the zones this product is linked to (if any), but accept any
    //    zone of the user that geometrically contains the point — this matches
    //    the spec: "If the point is inside at least one zone, accept."
    const zones = await prisma.zone.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, centerLat: true, centerLng: true, radius: true },
    });

    const containing = zones
      .map((z) => ({
        zone: z,
        distance: haversineMeters(customerLat, customerLng, z.centerLat, z.centerLng),
      }))
      .filter((x) => x.distance <= x.zone.radius)
      .sort((a, b) => a.distance - b.distance);

    if (containing.length === 0) {
      return jsonError(
        "Customer address is outside all delivery zones.",
        422
      );
    }

    const assignedZone = containing[0].zone;

    // 4. Create order + decrement stock atomically
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          productId: product.id,
          quantity,
          customerLat,
          customerLng,
          address,
          userId: user.id,
          zoneId: assignedZone.id,
        },
        include: {
          product: { select: { id: true, name: true, price: true } },
          zone: { select: { id: true, name: true } },
        },
      }),
      prisma.product.update({
        where: { id: product.id },
        data: { quantity: { decrement: quantity } },
      }),
    ]);

    return Response.json({ order }, { status: 201 });
  } catch (e: any) {
    return jsonError(e?.message ?? "Server error", e?.status ?? 500);
  }
}