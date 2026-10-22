"use client";

import dynamic from "next/dynamic";

const MapClick = dynamic(() => import("./MapClick"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl bg-gray-100 animate-pulse" />
  ),
});

export default MapClick;