"use client";

import { useEffect, useMemo, useState } from "react";
import MapClick from "@/components/MapClickClient";

type Zone = {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radius: number;
};
type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  zones: { zone: { id: string; name: string } }[];
};
type Order = {
  id: string;
  quantity: number;
  address: string;
  createdAt: string;
  product: { id: string; name: string; price: number };
  zone: { id: string; name: string };
};

export default function DashboardPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/zones").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ]).then(([z, p, o]) => {
      setZones(z.zones ?? []);
      setProducts(p.products ?? []);
      setOrders(o.orders ?? []);
    });
  }, []);

  const circles = useMemo(
    () =>
      zones.map((z) => ({
        id: z.id,
        name: z.name,
        centerLat: z.centerLat,
        centerLng: z.centerLng,
        radius: z.radius,
      })),
    [zones]
  );

  // Group products + orders per zone
  const perZone = useMemo(() => {
    return zones.map((z) => {
      const zoneProducts = products.filter((p) =>
        p.zones.some((pz) => pz.zone.id === z.id)
      );
      const zoneOrders = orders.filter((o) => o.zone.id === z.id);
      const revenue = zoneOrders.reduce(
        (sum, o) => sum + o.product.price * o.quantity,
        0
      );
      return { zone: z, products: zoneProducts, orders: zoneOrders, revenue };
    });
  }, [zones, products, orders]);

  const totals = useMemo(() => {
    const revenue = orders.reduce(
      (s, o) => s + o.product.price * o.quantity,
      0
    );
    return {
      zones: zones.length,
      products: products.length,
      orders: orders.length,
      revenue,
    };
  }, [zones, products, orders]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Zones" value={totals.zones} />
        <Kpi label="Products" value={totals.products} />
        <Kpi label="Orders" value={totals.orders} />
        <Kpi label="Revenue" value={`$${totals.revenue.toFixed(2)}`} />
      </div>

      {/* Map */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Coverage map</h2>
        {zones.length === 0 ? (
          <p className="text-sm text-gray-500">
            No zones yet — create one on the Zones page.
          </p>
        ) : (
          <MapClick
            center={[zones[0].centerLat, zones[0].centerLng]}
            zoom={11}
            circles={circles}
            height="360px"
          />
        )}
      </section>

      {/* Per-zone breakdown */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Zones</h2>
        {perZone.length === 0 && (
          <p className="text-sm text-gray-500">Nothing to show yet.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {perZone.map(({ zone, products, orders, revenue }) => (
            <div
              key={zone.id}
              className="bg-white rounded-2xl shadow p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg">{zone.name}</h3>
                  <p className="text-xs text-gray-500">
                    Radius {Math.round(zone.radius)} m ·{" "}
                    {zone.centerLat.toFixed(4)}, {zone.centerLng.toFixed(4)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{orders.length} orders</p>
                  <p className="text-xs text-gray-500">
                    ${revenue.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Products ({products.length})
                </p>
                {products.length === 0 ? (
                  <p className="text-xs text-gray-500">—</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {products.map((p) => (
                      <li key={p.id} className="text-sm text-gray-800">
                        {p.name} — ${p.price.toFixed(2)} · stock {p.quantity}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Recent orders
                </p>
                {orders.length === 0 ? (
                  <p className="text-xs text-gray-500">—</p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {orders.slice(0, 5).map((o) => (
                      <li
                        key={o.id}
                        className="text-sm text-gray-800 flex justify-between gap-2"
                      >
                        <span className="truncate">
                          {o.product.name} × {o.quantity}
                        </span>
                        <span className="text-xs text-gray-500 shrink-0">
                          ${(o.product.price * o.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}