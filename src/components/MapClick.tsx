"use client";

import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet + bundlers)
const ICON_URL = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const ICON_RETINA = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const SHADOW = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: ICON_URL,
  iconRetinaUrl: ICON_RETINA,
  shadowUrl: SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export type ZoneCircle = {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radius: number;
};

type Props = {
  center?: [number, number];
  zoom?: number;
  marker?: [number, number] | null;
  onMapClick?: (lat: number, lng: number) => void;
  circles?: ZoneCircle[];
  height?: string;
};

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ center }: { center?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center);
  }, [center?.[0], center?.[1]]);
  return null;
}

export default function MapClick({
  center = [33.5731, -7.5898],
  zoom = 11,
  marker = null,
  onMapClick,
  circles = [],
  height = "400px",
}: Props) {
  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onMapClick={onMapClick} />
        <Recenter center={center} />
        {marker && <Marker position={marker} />}
        {circles.map((c) => (
          <Circle
            key={c.id}
            center={[c.centerLat, c.centerLng]}
            radius={c.radius}
            pathOptions={{ color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.15 }}
          />
        ))}
      </MapContainer>
    </div>
  );
}