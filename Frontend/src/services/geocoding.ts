/**
 * Geocoding Service using Nominatim (OpenStreetMap)
 * Free service - no API key required
 * For production, consider using Google Maps Geocoding API or similar
 */

export interface PlaceResult {
  id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface GeocodeResult {
  display_name: string;
  lat: number;
  lon: number;
}

/**
 * Search for places by name using Nominatim
 * Returns list of matching places with autocomplete suggestions
 */
export const searchPlaces = async (
  query: string,
  limit: number = 5
): Promise<PlaceResult[]> => {
  if (!query.trim()) return [];

  try {
    // Format query for Nepal/South Asia focus
    const searchQuery = query.includes(",")
      ? query
      : `${query}, Nepal`;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: searchQuery,
          format: "json",
          limit: limit.toString(),
          countrycodes: "np", // Focus on Nepal
        }).toString(),
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );

    if (!response.ok) throw new Error("Geocoding request failed");

    const data = await response.json();

    return data.map((item: any) => ({
      id: `${item.lat}-${item.lon}`,
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
      type: item.type,
    }));
  } catch (error) {
    console.error("Place search error:", error);
    return [];
  }
};

/**
 * Reverse geocode - get address from coordinates
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<GeocodeResult | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
        new URLSearchParams({
          format: "json",
          lat: lat.toString(),
          lon: lng.toString(),
        }).toString(),
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );

    if (!response.ok) throw new Error("Reverse geocoding failed");

    const data = await response.json();

    return {
      display_name: data.address?.city || data.address?.town || data.display_name,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

/**
 * Forward geocode - get coordinates from address
 * Returns the first/most accurate result
 */
export const geocodeAddress = async (
  address: string
): Promise<GeocodeResult | null> => {
  try {
    const searchQuery = address.includes(",")
      ? address
      : `${address}, Nepal`;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: searchQuery,
          format: "json",
          limit: "1",
          countrycodes: "np",
        }).toString(),
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );

    if (!response.ok) throw new Error("Geocoding failed");

    const data = await response.json();

    if (data.length === 0) {
      // Try without country restriction
      const retryResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: address,
            format: "json",
            limit: "1",
          }).toString()
      );

      if (!retryResponse.ok) throw new Error("Geocoding failed");

      const retryData = await retryResponse.json();

      if (retryData.length === 0) return null;

      return {
        display_name: retryData[0].display_name,
        lat: parseFloat(retryData[0].lat),
        lon: parseFloat(retryData[0].lon),
      };
    }

    return {
      display_name: data[0].display_name,
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};
