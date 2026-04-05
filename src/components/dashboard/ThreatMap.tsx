"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import for Leaflet because it requires window
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

interface ThreatLocation {
  id: string;
  lat: number;
  lng: number;
  level: string;
}

export default function ThreatMap({ locations }: { locations: ThreatLocation[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fix default icon issues with leaflet in Next.js
    delete (window as any).L?.Icon?.Default?.prototype?._getIconUrl;
  }, []);

  if (!mounted) return <div className="h-full w-full bg-card/50 rounded-lg animate-pulse border border-border" />;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%', background: '#0a0a0f' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {locations.map((loc) => (
          <CircleMarker
            key={loc.id}
            center={[loc.lat, loc.lng]}
            radius={loc.level === 'CRITICAL' ? 8 : loc.level === 'MEDIUM' ? 6 : 4}
            pathOptions={{
              color: loc.level === 'CRITICAL' ? '#ff3366' : loc.level === 'MEDIUM' ? '#eab308' : '#39ff14',
              fillColor: loc.level === 'CRITICAL' ? '#ff3366' : loc.level === 'MEDIUM' ? '#eab308' : '#39ff14',
              fillOpacity: 0.7,
              weight: 1
            }}
          >
            <Popup className="dark-popup">
              <div className="text-xs font-mono">
                Threat Level: <span className="font-bold">{loc.level}</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
