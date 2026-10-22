"use client";

import { useEffect, useState } from "react";
import MapClick from "@/components/MapClickClient";

type Zone = {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radius: number;
};

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [name, setName] = useState("");
  const [radius, setRadius] = useState("1000");
  const [point, setPoint] = useState<[number, number] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/zones");
    const data = await res.json();
    if (res.ok) setZones(data.zones);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setErr(null);
    if (!point) return setErr("Click the map to set the zone center");
    if (!name.trim()) return setErr("Enter a name");
    const r = Number(radius);
    if (!r || r <= 0) return setErr("Enter a valid radius in meters");

    setLoading(true);
    const res = await fetch("/api/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        centerLat: point[0],
        centerLng: point[1],
        radius: r,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setErr(data.error ?? "Save failed");
    setName("");
    setPoint(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this zone?")) return;
    const res = await fetch(`/api/zones/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  const circles = zones.map((z) => ({
    id: z.id,
    name: z.name,
    centerLat: z.centerLat,
    centerLng: z.centerLng,
    radius: z.radius,
  }));

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Zones</h1>

      {err && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{err}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Zone name"
          className="h-12 rounded-lg border border-gray-300 px-3 md:col-span-2"
        />
        <input
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          placeholder="Radius (m)"
          type="number"
          min={1}
          className="h-12 rounded-lg border border-gray-300 px-3"
        />
      </div>

      <p className="text-sm text-gray-600">
        Tap on the map to set the center.{" "}
        {point && (
          <span className="font-mono">
            ({point[0].toFixed(5)}, {point[1].toFixed(5)})
          </span>
        )}
      </p>

      <MapClick
        marker={point}
        onMapClick={(lat, lng) => setPoint([lat, lng])}
        circles={circles}
        height="420px"
      />

      <button
        onClick={save}
        disabled={loading}
        className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save zone"}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {zones.length === 0 && (
          <p className="text-gray-500 text-sm">No zones yet.</p>
        )}
        {zones.map((z) => (
          <div key={z.id} className="bg-white rounded-xl shadow p-4 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{z.name}</h2>
              <button
                onClick={() => remove(z.id)}
                className="text-red-600 text-sm font-medium"
              >
                Delete
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Center: {z.centerLat.toFixed(5)}, {z.centerLng.toFixed(5)}
            </p>
            <p className="text-xs text-gray-500">Radius: {Math.round(z.radius)} m</p>
          </div>
        ))}
      </div>
    </div>
  );
}