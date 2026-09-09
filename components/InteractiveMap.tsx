"use client";

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

type Destination = { id: string; name: string; region: string; summary: string; latitude: number; longitude: number; slug: string };

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function FitBounds({ destinations }: { destinations: Destination[] }) {
  const map = useMap();
  useEffect(() => {
    if (!destinations.length) return;
    map.fitBounds(destinations.map((d) => [d.latitude, d.longitude] as [number, number]), { padding: [30, 30] });
  }, [destinations, map]);
  return null;
}

export default function InteractiveMap({ destinations }: { destinations: Destination[] }) {
  return (
    <MapContainer center={[7.8731, 80.7718]} zoom={8} scrollWheelZoom className="h-[430px] w-full z-0">
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds destinations={destinations} />
      {destinations.map((d) => (
        <Marker key={d.id} position={[d.latitude, d.longitude]} icon={markerIcon}>
          <Popup>
            <div className="min-w-[180px]">
              <strong className="text-base">{d.name}</strong>
              <p className="mt-1 text-xs text-gray-600">{d.region}</p>
              <p className="mt-2 text-sm">{d.summary}</p>
              <a href={`/destinations/${d.slug}`} className="mt-3 inline-block font-bold text-emerald-900">Explore destination →</a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
