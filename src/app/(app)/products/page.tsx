"use client";

import { useEffect, useState } from "react";

type Zone = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  zones: { zone: { id: string; name: string } }[];
  _count: { orders: number };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("10");
  const [quantity, setQuantity] = useState("10");
  const [zoneIds, setZoneIds] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    const [p, z] = await Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/zones").then((r) => r.json()),
    ]);
    setProducts(p.products ?? []);
    setZones(z.zones ?? []);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function toggleZone(id: string) {
    setZoneIds((prev) =>
      prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price: Number(price),
        quantity: Number(quantity),
        zoneIds,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error ?? "Save failed");
    setName("");
    setPrice("10");
    setQuantity("10");
    setZoneIds([]);
    loadAll();
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) loadAll();
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Products</h1>

      {err && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{err}</div>
      )}

      <form onSubmit={save} className="bg-white rounded-2xl shadow p-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Product name"
          className="w-full h-12 rounded-lg border border-gray-300 px-3"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            step="0.01"
            min={0}
            required
            placeholder="Price"
            className="w-full h-12 rounded-lg border border-gray-300 px-3"
          />
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            type="number"
            min={0}
            required
            placeholder="Stock"
            className="w-full h-12 rounded-lg border border-gray-300 px-3"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Assign to zones (optional)
          </p>
          {zones.length === 0 ? (
            <p className="text-xs text-gray-500">
              No zones yet — create zones first to assign this product.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {zones.map((z) => {
                const active = zoneIds.includes(z.id);
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => toggleZone(z.id)}
                    className={
                      "px-3 h-10 rounded-lg text-sm font-medium border " +
                      (active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300")
                    }
                  >
                    {z.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          disabled={loading}
          className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60"
        >
          {loading ? "Saving..." : "Add product"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {products.length === 0 && (
          <p className="text-gray-500 text-sm">No products yet.</p>
        )}
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow p-4 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{p.name}</h2>
              <button
                onClick={() => remove(p.id)}
                className="text-red-600 text-sm font-medium"
              >
                Delete
              </button>
            </div>
            <p className="text-sm text-gray-700">
              ${p.price.toFixed(2)} · Stock: {p.quantity}
            </p>
            <p className="text-xs text-gray-500">
              Orders: {p._count.orders}
            </p>
            <p className="text-xs text-gray-500">
              Zones:{" "}
              {p.zones.length === 0
                ? "—"
                : p.zones.map((z) => z.zone.name).join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
