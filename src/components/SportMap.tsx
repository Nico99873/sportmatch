"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import type { Sport } from "@prisma/client";
import { SPORT_INFO } from "@/lib/sports";
import { formatDistance } from "@/lib/geo";

type Item = {
  id: string;
  name: string;
  sport: Sport;
  lat: number;
  lon: number;
  rating: number;
  distanceKm: number;
  address: string;
};

function makeIcon(sport: Sport, selected: boolean) {
  const info = SPORT_INFO[sport];
  const size = selected ? 38 : 30;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${info.color};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.4);border:2px solid white;"><span style="display:inline-block;transform:rotate(45deg);font-size:${selected ? 16 : 13}px;line-height:1;">${info.emoji}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#185FA5;border:3px solid white;box-shadow:0 0 0 2px #185FA5;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function FlyToSelected({ item }: { item?: Item }) {
  const map = useMap();
  useEffect(() => {
    if (item) {
      map.flyTo([item.lat, item.lon], Math.max(map.getZoom(), 14), { duration: 0.5 });
    }
  }, [item, map]);
  return null;
}

function InvalidateSizeOnVisible() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    // Leaflet measures its container once at creation time. On mobile the map
    // mounts inside the (hidden) "Mappa" tab, so it initializes at 0x0 and
    // never recovers on its own once the tab becomes visible — this watches
    // for that visibility/size change and forces Leaflet to re-measure.
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

function FlyToOrigin({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    map.flyTo([lat, lon], 12, { duration: 0.8 });
  }, [lat, lon, map]);

  return null;
}

export default function SportMap({
  items,
  userLoc,
  selectedId,
  onSelect,
}: {
  items: Item[];
  userLoc: { lat: number; lon: number };
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const selectedItem = items.find((i) => i.id === selectedId);
  const initialCenter = useMemo<[number, number]>(
    () => (items.length ? [items[0].lat, items[0].lon] : [userLoc.lat, userLoc.lon]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <MapContainer center={initialCenter} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[userLoc.lat, userLoc.lon]} icon={userIcon}>
        <Popup>La tua posizione</Popup>
      </Marker>
      {items.map((item) => (
        <Marker
          key={item.id}
          position={[item.lat, item.lon]}
          icon={makeIcon(item.sport, item.id === selectedId)}
          eventHandlers={{ click: () => onSelect(item.id) }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{item.name}</p>
              <p>
                {SPORT_INFO[item.sport].emoji} {SPORT_INFO[item.sport].label} · ⭐{item.rating.toFixed(1)}
              </p>
              <p className="text-xs text-zinc-500">
                {formatDistance(item.distanceKm)} · {item.address}
              </p>
              <Link href={`/asd/${item.id}`} className="text-sm-blue underline">
                Vedi profilo
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      <FlyToSelected item={selectedItem} />
      <FlyToOrigin lat={userLoc.lat} lon={userLoc.lon} />
      <InvalidateSizeOnVisible />
    </MapContainer>
  );
}
