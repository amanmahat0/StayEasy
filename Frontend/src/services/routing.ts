/**
 * Routing Service using OSRM (Open Source Routing Machine)
 * Free service - no API key required
 * Provides real routing calculations for distance and duration
 */

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  name?: string;
}

export interface RouteResult {
  distance: number; // in meters
  duration: number; // in seconds
  polyline: Array<[number, number]>; // lat, lng pairs
  steps: RouteStep[];
  summary: {
    totalDistance: string;
    totalDuration: string;
    totalDurationMinutes: number;
  };
}

/**
 * Calculate route between two coordinates using OSRM
 * Returns distance, duration, polyline, and turn-by-turn directions
 */
export const calculateRoute = async (
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<RouteResult | null> => {
  try {
    // OSRM expects lng,lat format (opposite of leaflet)
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=polyline&steps=true&geometries=geojson&annotations=distance,duration`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Routing request failed");
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      console.warn("No route found");
      return null;
    }

    const route = data.routes[0];
    const distanceKm = (route.distance / 1000).toFixed(2);
    const durationMinutes = Math.round(route.duration / 60);

    // Extract turn-by-turn instructions from route legs
    const steps: RouteStep[] = [];

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

    // If no steps found, create a simple instruction
    if (steps.length === 0) {
      steps.push({
        instruction: "Head towards destination",
        distance: route.distance,
        duration: route.duration,
      });
    }

    // Convert polyline to lat,lng pairs
    const coordinates = route.geometry.coordinates.map((coord: any) => [
      coord[1], // lat
      coord[0], // lng
    ]);

    return {
      distance: route.distance,
      duration: route.duration,
      polyline: coordinates,
      steps: steps.slice(0, 10), // Limit to first 10 steps for display
      summary: {
        totalDistance: `${distanceKm} km`,
        totalDuration: `${durationMinutes} mins`,
        totalDurationMinutes: durationMinutes,
      },
    };
  } catch (error) {
    console.error("Route calculation error:", error);
    return null;
  }
};

/**
 * Calculate simple distance using Haversine formula
 * Fallback when routing service is unavailable
 */
export const calculateSimpleDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): { distance: number; duration: number } => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Estimate duration at ~3 minutes per km (average for Nepal traffic)
  const duration = Math.round(distance * 3);

  return {
    distance: distance * 1000, // convert to meters
    duration: duration * 60, // convert to seconds
  };
};
