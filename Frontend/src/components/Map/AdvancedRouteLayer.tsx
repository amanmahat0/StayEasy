import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export interface RouteOption {
  distance: string;
  duration: string;
  polyline: Array<[number, number]>;
  durationMinutes: number;
  steps?: Array<{ instruction: string; distance: number; duration: number; name?: string }>;
}

interface AdvancedRouteLayerProps {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  brandColor?: string;
  secondaryColor?: string;
  onRoutesLoaded?: (routes: RouteOption[]) => void;
  selectedRouteIndex?: number;
  showAlternateRoutes?: boolean;
  transportMode?: "driving" | "cycling" | "walking";
}

/**
 * Advanced Route Layer with multiple route options, detailed markers, and animations
 * Similar to Google Maps directions with primary and alternate routes
 */
const AdvancedRouteLayer = ({
  startLat,
  startLng,
  endLat,
  endLng,
  brandColor = "#A87DC2",
  secondaryColor = "#D0B3E3",
  onRoutesLoaded,
  selectedRouteIndex = 0,
  showAlternateRoutes = true,
  transportMode = "driving",
}: AdvancedRouteLayerProps) => {
  const map = useMap();
  const polylineRefs = useRef<L.Polyline[]>([]);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const routesRef = useRef<RouteOption[]>([]);

  // Create start location marker (pulsing green dot)
  const createStartMarker = () => {
    const html = `
      <div class="relative w-8 h-8">
        <div class="absolute inset-0 rounded-full bg-green-500 animate-pulse opacity-75"></div>
        <div class="absolute inset-1 rounded-full bg-green-500 shadow-lg"></div>
        <div class="absolute inset-2 rounded-full bg-white"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-start-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  // Create end location marker (destination pin)
  const createEndMarker = () => {
    const html = `
      <div class="w-8 h-10 bg-red-500 rounded-t-full rounded-b-sm shadow-lg flex items-center justify-center border-2 border-white">
        <div class="w-2 h-2 bg-white rounded-full"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-end-marker",
      iconSize: [32, 40],
      iconAnchor: [16, 40],
    });
  };

  // Fetch route(s) from OSRM API
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        // Validate all coordinates are valid numbers
        if (!Number.isFinite(startLat) || !Number.isFinite(startLng) || !Number.isFinite(endLat) || !Number.isFinite(endLng)) {
          console.warn("Invalid coordinates for route calculation", { startLat, startLng, endLat, endLng });
          return;
        }

        // Ensure coordinates are within valid ranges
        if (Math.abs(startLat) > 90 || Math.abs(startLng) > 180 || Math.abs(endLat) > 90 || Math.abs(endLng) > 180) {
          console.warn("Coordinates out of valid range");
          return;
        }

        console.log("Fetching routes:", { startLat, startLng, endLat, endLng });

        // OSRM expects lng,lat format (not lat,lng)
        const url = `https://router.project-osrm.org/route/v1/driving/${parseFloat(startLng.toString())},${parseFloat(startLat.toString())};${parseFloat(endLng.toString())},${parseFloat(endLat.toString())}?overview=full&steps=true&geometries=geojson&annotations=distance,duration&alternatives=2`;

        console.log("OSRM URL:", url);

        const response = await fetch(url);

        if (!response.ok) {
          console.error(`OSRM Error: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Route fetch failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
          console.warn("No routes found in OSRM response");
          return;
        }

        console.log(`Found ${data.routes.length} route(s)`);

        // Process all available routes
        const routes: RouteOption[] = data.routes.slice(0, 3).map((route: any, idx: number) => {
          const distanceKm = (route.distance / 1000).toFixed(2);
          const durationMinutes = Math.round(route.duration / 60);

          console.log(`Route ${idx}: ${distanceKm}km, ${durationMinutes}min`);

          // Extract turn-by-turn instructions
          const steps: Array<{ instruction: string; distance: number; duration: number; name?: string }> = [];
          if (route.legs && route.legs.length > 0) {
            route.legs.forEach((leg: any) => {
              if (leg.steps && leg.steps.length > 0) {
                leg.steps.forEach((step: any) => {
                  if (step.maneuver && step.maneuver.instruction) {
                    steps.push({
                      instruction: step.maneuver.instruction,
                      distance: step.distance,
                      duration: step.duration,
                      name: step.name || "Unnamed road",
                    });
                  }
                });
              }
            });
          }

          // Convert geometry to polyline coordinates
          const coordinates = route.geometry.coordinates.map((coord: any) => [
            coord[1], // lat
            coord[0], // lng
          ]);

          return {
            distance: `${distanceKm} km`,
            duration: `${durationMinutes} min`,
            polyline: coordinates,
            durationMinutes,
            steps: steps.slice(0, 8), // First 8 steps
          };
        });

        routesRef.current = routes;
        onRoutesLoaded?.(routes);
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
    };

    // Only fetch if all coordinates are valid
    if (Number.isFinite(startLat) && Number.isFinite(startLng) && Number.isFinite(endLat) && Number.isFinite(endLng)) {
      console.log("Triggering route fetch...");
      fetchRoutes();
    } else {
      console.warn("Skipping route fetch - invalid coordinates");
    }
  }, [startLat, startLng, endLat, endLng, onRoutesLoaded]);

  // Draw polylines on map
  useEffect(() => {
    if (!map || routesRef.current.length === 0) return;

    // Clear existing polylines
    polylineRefs.current.forEach((polyline) => {
      if (map.hasLayer(polyline)) {
        map.removeLayer(polyline);
      }
    });
    polylineRefs.current = [];

    // Draw primary route (index 0)
    if (routesRef.current[selectedRouteIndex]) {
      const primaryRoute = routesRef.current[selectedRouteIndex];
      const primaryPolyline = L.polyline(primaryRoute.polyline, {
        color: brandColor,
        weight: 5,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
        dashArray: undefined,
        className: "primary-route",
      }).addTo(map);

      polylineRefs.current.push(primaryPolyline);

      // Add click handler for route info
      primaryPolyline.bindPopup(`
        <div class="text-center">
          <div class="font-bold text-gray-900">${primaryRoute.distance}</div>
          <div class="text-sm text-gray-600">${primaryRoute.duration}</div>
        </div>
      `);
    }

    // Draw alternate routes if available and enabled
    if (showAlternateRoutes) {
      for (let i = 1; i < routesRef.current.length; i++) {
        const alternateRoute = routesRef.current[i];
        const alternatePolyline = L.polyline(alternateRoute.polyline, {
          color: secondaryColor,
          weight: 3,
          opacity: 0.6,
          lineCap: "round",
          lineJoin: "round",
          dashArray: "10, 5",
          interactive: true,
        }).addTo(map);

        alternatePolyline.on("click", () => {
          onRoutesLoaded?.(routesRef.current);
        });

        alternatePolyline.bindPopup(`
          <div class="text-center">
            <div class="font-bold text-gray-900">${alternateRoute.distance}</div>
            <div class="text-sm text-gray-600">${alternateRoute.duration}</div>
          </div>
        `);

        polylineRefs.current.push(alternatePolyline);
      }
    }

    // Add start marker
    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
    }
    startMarkerRef.current = L.marker([startLat, startLng], {
      icon: createStartMarker(),
      zIndexOffset: 100,
    }).addTo(map);

    // Add end marker
    if (endMarkerRef.current) {
      map.removeLayer(endMarkerRef.current);
    }
    endMarkerRef.current = L.marker([endLat, endLng], {
      icon: createEndMarker(),
      zIndexOffset: 101,
    }).addTo(map);

    // Fit map to show entire route
    if (routesRef.current[selectedRouteIndex]) {
      const bounds = L.latLngBounds(routesRef.current[selectedRouteIndex].polyline);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      polylineRefs.current.forEach((polyline) => {
        if (map.hasLayer(polyline)) {
          map.removeLayer(polyline);
        }
      });
    };
  }, [map, selectedRouteIndex, showAlternateRoutes, brandColor, secondaryColor, onRoutesLoaded]);

  return null;
};

export default AdvancedRouteLayer;
