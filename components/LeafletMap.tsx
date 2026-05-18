import React, { useEffect, useRef } from 'react';

declare const L: any;

interface LeafletMapProps {
  coordinates?: { lat: number; lng: number }; // 🔥 made optional
  zoom?: number;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  showRadius?: boolean;
  height?: string;
  label?: string;
}

const DEFAULT_COORDS = { lat: 21.1458, lng: 79.0882 }; // Nagpur fallback

const LeafletMap: React.FC<LeafletMapProps> = ({
  coordinates,
  zoom = 13,
  interactive = false,
  onLocationSelect,
  showRadius = false,
  height = "400px",
  label
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  // 🔥 ALWAYS SAFE COORDS
  const safeCoords =
    coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number'
      ? coordinates
      : DEFAULT_COORDS;

  useEffect(() => {
    if (typeof L === 'undefined' || !mapRef.current) return;

    try {
      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        dragging: interactive,
        touchZoom: interactive
      }).setView([safeCoords.lat, safeCoords.lng], zoom);

      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const icon = L.divIcon({
        className: '',
        html: `<div style="background:#dc2626;width:15px;height:15px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(0,0,0,0.2);"></div>`,
        iconSize: [15, 15],
        iconAnchor: [7, 7]
      });

      markerRef.current = L.marker(
        [safeCoords.lat, safeCoords.lng],
        { icon }
      ).addTo(map);

      if (label) markerRef.current.bindPopup(label);

      if (showRadius) {
        circleRef.current = L.circle(
          [safeCoords.lat, safeCoords.lng],
          {
            color: '#dc2626',
            fillColor: '#ef4444',
            fillOpacity: 0.1,
            radius: 800
          }
        ).addTo(map);
      }

      if (interactive && onLocationSelect) {
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          onLocationSelect(lat, lng);
        });
      }

      setTimeout(() => {
        mapInstance.current?.invalidateSize();
      }, 300);

      return () => {
        mapInstance.current?.remove();
        mapInstance.current = null;
      };
    } catch (err) {
      console.warn("Leaflet init failed:", err);
    }
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    try {
      mapInstance.current.flyTo([safeCoords.lat, safeCoords.lng], zoom);

      markerRef.current?.setLatLng([safeCoords.lat, safeCoords.lng]);

      if (circleRef.current && showRadius) {
        circleRef.current.setLatLng([safeCoords.lat, safeCoords.lng]);
      }
    } catch {
      // silent
    }
  }, [safeCoords.lat, safeCoords.lng, zoom, showRadius]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-gray-100 ${!interactive ? 'pointer-events-none' : ''}`}
      style={{ height }}
    >
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {interactive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-gray-600 shadow-sm z-[1000] uppercase tracking-wider">
          Click Map to Pin Location
        </div>
      )}
    </div>
  );
};

export default LeafletMap;