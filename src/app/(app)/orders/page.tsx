"use client";

import { useEffect, useMemo, useState } from "react";
import MapClick from "@/components/MapClickClient";

type Product = { id: string; name: string; price: number; quantity: number };
type Order = {
  id: string;
  quantity: number;
  address: string;
  customerLat: number;
  customerLng: number;
  createdAt: string;
  product: { id: string; name: string; price: number };
  zone: { id: string; name: string };
};

export default function OrdersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [address, setAddress] = useState("");
  const [point, setPoint] = useState<[number, number] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    const [p, o] = await Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ]);
    setProducts(p.products ?? []);
    setOrders(o.orders ?? []);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId),
    [productId, products]
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    if (!productId) return setErr("Choose a product");
    if (!point) return setErr("Click the map to pick the customer address");

    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity: Number(quantity),
        customerLat: point[0],
        customerLng: point[1],
        address: address.trim() || `${point[0].toFixed(5)}, ${point[1].toFixed(5)}`,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error ?? "Order failed");
    setOk(`Order placed in zone "${data.order.zone.name}"`);
    setQuantity("1");
    setAddress("");
    setPoint(null);
    loadAll();
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">New order</h1>

      {err && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{err}</div>
      )}
      {ok && (
        <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3">{ok}</div>
      )}

      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-4 space-y-3">
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full h-12 rounded-lg border border-gray-300 px-3 bg-white"
          required
        >
          <option value="">Select product…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — ${p.price.toFixed(2)} (stock {p.quantity})
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            type="number"
            min={1}
            required
            placeholder="Quantity"
            className="w-full h-12 rounded-lg border border-gray-300 px-3"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address label"
            className="w-full h-12 rounded-lg border border-gray-300 px-3"
          />
        </div>

        {selectedProduct && (
          <p className="text-xs text-gray-500">
            Max available: {selectedProduct.quantity}
          </p>
        )}

        <p className="text-sm text-gray-600">
          Tap the map to set the customer location.{" "}
          {point && (
            <span className="font-mono">
              ({point[0].toFixed(5)}, {point[1].toFixed(5)})
            </span>
          )}
        </p>

        <MapClick
          marker={point}
          onMapClick={(lat, lng) => setPoint([lat, lng])}
          height="380px"
        />

        <button
          disabled={loading}
          className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60"
        >
          {loading ? "Placing…" : "Place order"}
        </button>
      </form>

      <h2 className="text-xl font-bold pt-2">Orders</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {orders.length === 0 && (
          <p className="text-gray-500 text-sm">No orders yet.</p>
        )}
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-xl shadow p-4 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">
                {o.product.name} × {o.quantity}
              </h3>
              <span className="text-xs text-gray-500">
                {new Date(o.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700">{o.address}</p>
            <p className="text-xs text-gray-500">
              Zone: <span className="font-medium">{o.zone.name}</span> ·{" "}
              {o.customerLat.toFixed(5)}, {o.customerLng.toFixed(5)}
            </p>
            <p className="text-xs text-gray-500">
              Total: ${(o.product.price * o.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
