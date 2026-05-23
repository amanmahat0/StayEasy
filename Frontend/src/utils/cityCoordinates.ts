/**
 * Real city coordinates for Nepal
 * Maps city names to their accurate latitude and longitude
 * Data source: OpenStreetMap / Google Maps
 */

export interface CityCoords {
  latitude: number;
  longitude: number;
  zoom?: number;
}

export const CITY_COORDINATES: Record<string, CityCoords> = {
  // Kathmandu Valley
  "Kathmandu": {
    latitude: 27.7172,
    longitude: 85.324,
    zoom: 13,
  },
  "Bhaktapur": {
    latitude: 27.6724,
    longitude: 85.4289,
    zoom: 13,
  },
  "Lalitpur": {
    latitude: 27.6408,
    longitude: 85.3132,
    zoom: 13,
  },
  "Patan": {
    latitude: 27.6408,
    longitude: 85.3132,
    zoom: 13,
  },

  // Central Region
  "Pokhara": {
    latitude: 28.2096,
    longitude: 83.9856,
    zoom: 12,
  },
  "Chitwan": {
    latitude: 27.5522,
    longitude: 84.4256,
    zoom: 12,
  },

  // Eastern Region
  "Biratnagar": {
    latitude: 26.4519,
    longitude: 87.2819,
    zoom: 12,
  },
  "Dharan": {
    latitude: 26.8167,
    longitude: 87.2833,
    zoom: 12,
  },
  "Ilam": {
    latitude: 26.9124,
    longitude: 87.9289,
    zoom: 12,
  },

  // Western Region
  "Nepalgunj": {
    latitude: 28.0656,
    longitude: 81.8778,
    zoom: 12,
  },
  "Butwal": {
    latitude: 27.8141,
    longitude: 83.4397,
    zoom: 12,
  },

  // Far-western Region
  "Dhangadi": {
    latitude: 29.1947,
    longitude: 80.5941,
    zoom: 12,
  },

  // Mid-western Region
  "Janakpur": {
    latitude: 26.7289,
    longitude: 85.9247,
    zoom: 12,
  },
  "Birgunj": {
    latitude: 27.1809,
    longitude: 84.8831,
    zoom: 12,
  },
};

/**
 * Get coordinates for a city
 * Returns real coordinates or defaults to Kathmandu center
 */
export const getCityCoordinates = (cityName?: string): CityCoords => {
  if (!cityName) {
    return CITY_COORDINATES["Kathmandu"];
  }

  // Try exact match first
  const exactMatch = CITY_COORDINATES[cityName];
  if (exactMatch) {
    return exactMatch;
  }

  // Try case-insensitive match
  const caseInsensitiveMatch = Object.entries(CITY_COORDINATES).find(
    ([key]) => key.toLowerCase() === cityName.toLowerCase()
  );
  
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch[1];
  }

  // If city not found, return Kathmandu as default
  console.warn(`City "${cityName}" not found in coordinates mapping. Using Kathmandu.`);
  return CITY_COORDINATES["Kathmandu"];
};

/**
 * Get zoom level for a city
 */
export const getCityZoomLevel = (cityName?: string): number => {
  const coords = getCityCoordinates(cityName);
  return coords.zoom || 13;
};
