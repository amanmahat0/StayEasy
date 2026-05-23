import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface RouteLayerProps {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  brandColor?: string;
  showCurrentLocation?: boolean;
}

/**
 * Route layer component that draws a polyline path from start to destination
 * Uses app's brand color (#A87DC2) for the route line
 */
const RouteLayer = ({
  startLat,
  startLng,
  endLat,
  endLng,
  brandColor = "#A87DC2",
  showCurrentLocation = true,
}: RouteLayerProps) => {
  const map = useMap();
  const polylineRef = useRef<L.Polyline | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const animatedMarkerRef = useRef<L.Marker | null>(null);

  // Create custom current location marker with pulsing animation
  const createAnimatedMarker = () => {
    const html = `
      <div class="relative w-6 h-6">
        <div class="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-75"></div>
        <div class="absolute inset-1 rounded-full bg-green-500"></div>
        <div class="absolute inset-1.5 rounded-full bg-white"></div>
      </div>
    `;
    
    return L.divIcon({
      html,
      className: 'custom-animated-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  useEffect(() => {
    if (!map) return;

    // Validate coordinates before drawing
    if (!Number.isFinite(startLat) || !Number.isFinite(startLng) || !Number.isFinite(endLat) || !Number.isFinite(endLng)) {
      console.warn("RouteLayer: Invalid coordinates", { startLat, startLng, endLat, endLng });
      return;
    }

    console.log("RouteLayer: Drawing route", { startLat, startLng, endLat, endLng });

    // Draw polyline route with brand color
    const latlngs: [number, number][] = [
      [startLat, startLng],
      [endLat, endLng],
    ];

    // Remove existing polyline if any
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    // Create new polyline with brand color
    polylineRef.current = L.polyline(latlngs, {
      color: brandColor,
      weight: 5,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
      dashArray: undefined, // Solid line
    }).addTo(map);

    console.log("✅ RouteLayer: Polyline added to map");

    // Remove previous markers
    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
    }
    if (animatedMarkerRef.current) {
      map.removeLayer(animatedMarkerRef.current);
    }

    // Add animated current location marker (if enabled)
    if (showCurrentLocation) {
      animatedMarkerRef.current = L.marker([startLat, startLng], {
        icon: createAnimatedMarker(),
        zIndexOffset: 100,
      }).addTo(map);

      console.log("✅ RouteLayer: Start marker added");
    }

    // Fit map bounds to show entire route
    try {
      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50] });
      console.log("✅ RouteLayer: Map bounds fitted to route");
    } catch (error) {
      console.error("RouteLayer: Error fitting bounds:", error);
    }

    // Cleanup on unmount
    return () => {
      if (polylineRef.current && map.hasLayer(polylineRef.current)) {
        map.removeLayer(polylineRef.current);
      }
      if (startMarkerRef.current && map.hasLayer(startMarkerRef.current)) {
        map.removeLayer(startMarkerRef.current);
      }
      if (animatedMarkerRef.current && map.hasLayer(animatedMarkerRef.current)) {
        map.removeLayer(animatedMarkerRef.current);
      }
    };
  }, [map, startLat, startLng, endLat, endLng, brandColor, showCurrentLocation]);

  return null; // This component only manages map layers
};

export default RouteLayer;
