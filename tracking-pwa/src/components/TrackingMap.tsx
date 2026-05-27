'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((m) => m.Polyline), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

interface Position {
  lat: number;
  lng: number;
}

interface TrackingMapProps {
  storeLocation: Position;
  customerLocation: Position;
  driverLocation?: Position | null;
}

export default function TrackingMap({ storeLocation, customerLocation, driverLocation }: TrackingMapProps) {
  const [L, setL] = useState<typeof import('leaflet') | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    import('leaflet').then((leaflet) => {
      setL(leaflet);
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
  }, []);

  if (!mounted || !L) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--text-muted)',
        fontSize: 14,
      }}>
        Loading map...
      </div>
    );
  }

  const center: [number, number] = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : [(storeLocation.lat + customerLocation.lat) / 2, (storeLocation.lng + customerLocation.lng) / 2];

  const storeIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div style="width:36px;height:36px;background:#10b981;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(16,185,129,0.4);color:white;font-weight:700;">🏪</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  const customerIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div style="width:36px;height:36px;background:#3b82f6;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 12px rgba(59,130,246,0.4);color:white;">📍</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  const driverIcon = L.divIcon({
    className: 'custom-marker driver-marker',
    html: '<div style="width:42px;height:42px;background:linear-gradient(135deg,#f59e0b,#f97316);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 16px rgba(245,158,11,0.5);color:white;border:3px solid white;animation:pulse 2s infinite;">🛵</div>',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });

  const routePoints: [number, number][] = [];
  if (storeLocation && customerLocation) {
    routePoints.push([storeLocation.lat, storeLocation.lng]);
    if (driverLocation) {
      routePoints.push([driverLocation.lat, driverLocation.lng]);
    }
    routePoints.push([customerLocation.lat, customerLocation.lng]);
  }

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-lg)' }}
      zoomControl={false}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[storeLocation.lat, storeLocation.lng]} icon={storeIcon}>
        <Popup>Store Location</Popup>
      </Marker>

      <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
        <Popup>Your Location</Popup>
      </Marker>

      {driverLocation && (
        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
          <Popup>Driver is here</Popup>
        </Marker>
      )}

      {routePoints.length > 1 && (
        <Polyline
          positions={routePoints}
          pathOptions={{
            color: '#3b82f6',
            weight: 4,
            opacity: 0.6,
            dashArray: '10, 10',
          }}
        />
      )}
    </MapContainer>
  );
}
