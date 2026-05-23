# 🗺️ Google Maps Places Autocomplete & Routing API Integration

## Overview

The directions panel now includes **real-time Places Autocomplete** with **turn-by-turn routing calculations** using free, open-source services. No Google Maps API key required!

## Features Added

### ✅ 1. Places Autocomplete Search

- **Service**: Nominatim (OpenStreetMap)
- **Triggers**: When typing in the "Enter Location" field
- **Displays**: 5 suggestions matching the query
- **Smart**: Filters results for Nepal by default, can search globally
- **Fallback**: If no results in Nepal, searches worldwide
- **UX**:
  - Shows loading spinner while searching
  - Displays place names with full address breakdown
  - Click to select location
  - Shows "No results" message if nothing found

### ✅ 2. Real Route Calculation

- **Service**: OSRM (Open Source Routing Machine)
- **Calculates**:
  - Actual driving distance (in km)
  - Estimated duration (in minutes)
  - Turn-by-turn directions
  - Polyline coordinates for map visualization
- **Fallback**: Uses Haversine formula if OSRM unavailable
- **Accuracy**: Real-world routing, not just straight-line distance

### ✅ 3. Dual Location Input

**Option A: GPS Detection**

- Automatically detects user's current location
- Shows "Ready" when location is obtained
- Falls back to manual input if GPS unavailable

**Option B: Manual Location Search**

- Type any address (e.g., "Kathmandu", "Lalitpur Bus Station")
- See autocomplete suggestions
- Select from dropdown or confirm manual entry

### ✅ 4. Dynamic Route Preview

- **Distance**: Shows real calculated distance in km
- **Duration**: Shows estimated travel time in minutes
- **Turn-by-turn**: Displays first 10 directions steps
- **Proportional segments**: Each step shows its distance contribution

### ✅ 5. Enhanced UI/UX

- **Search spinner**: Loading indicator during place search
- **Suggestions dropdown**: Full address details below each suggestion
- **No results feedback**: User-friendly message when search fails
- **Brand colors**: Purple (#A987C8) accents throughout
- **Responsive**: Works on mobile, tablet, and desktop

## Service Architecture

### `src/services/geocoding.ts`

Handles all place search and address-to-coordinates conversion:

```typescript
// Search places by query - returns autocomplete suggestions
searchPlaces(query: string, limit?: number): Promise<PlaceResult[]>

// Convert address to coordinates
geocodeAddress(address: string): Promise<GeocodeResult | null>

// Convert coordinates back to address
reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null>
```

**Data Sources**:

- `PlaceResult`: Full suggestion with display_name, lat, lon, type
- `GeocodeResult`: Simplified result with just display_name, lat, lon

### `src/services/routing.ts`

Handles route calculation and distance estimation:

```typescript
// Calculate actual route between two points
calculateRoute(startLat, startLng, endLat, endLng): Promise<RouteResult | null>

// Fallback: Simple distance calculation
calculateSimpleDistance(lat1, lng1, lat2, lng2): { distance, duration }
```

**Data Returned**:

- `distance`: In meters
- `duration`: In seconds
- `polyline`: Array of [lat, lng] for drawing route on map
- `steps`: Turn-by-turn instructions
- `summary`: Human-readable distance and duration

## Component Integration

### GoogleMapsStyleDirections.tsx Updates

**New State Variables**:

```typescript
suggestions: PlaceResult[]              // Autocomplete results
showSuggestions: boolean               // Show/hide dropdown
searchingPlaces: boolean               // Loading indicator
selectedPlace: PlaceResult | null      // Currently selected place
```

**New Handlers**:

```typescript
handlePlaceSearch(query: string)        // Autocomplete search
handlePlaceSelect(place: PlaceResult)   // Select from suggestions
calculateAndDisplayRoute(lat, lng)      // Trigger route calculation
handleStart()                           // Updated to use real coordinates
```

**Flow**:

1. User selects "Enter Location" option
2. Types in search field → `handlePlaceSearch()` triggered
3. Autocomplete suggestions appear → User clicks one
4. `handlePlaceSelect()` updates location and calls `calculateAndDisplayRoute()`
5. Route is calculated and displayed
6. User clicks "Start Navigation" → `handleStart()` passes real coordinates to parent

## Usage Example

### From PropertyDetail Component:

```tsx
<GoogleMapsStyleDirections
  isOpen={showDirections}
  destinationTitle={property.title}
  destinationAddress={property.address}
  destinationLat={parseFloat(property.latitude)}
  destinationLng={parseFloat(property.longitude)}
  onClose={handleCloseDirections}
  onNavigate={handleNavigate}
/>
```

### Result:

- User opens directions → Google Maps-style panel appears
- Types "kathmandu bus station" → 5 suggestions appear
- Selects suggestion → Map shows distance "23.5 km, ~45 mins"
- Clicks "Start Navigation" → Full-screen map with route layer

## API Endpoints Used

### Nominatim (Geocoding)

```
GET https://nominatim.openstreetmap.org/search?q=...&format=json
GET https://nominatim.openstreetmap.org/reverse?lat=...&lon=...
```

### OSRM (Routing)

```
GET https://router.project-osrm.org/route/v1/driving/lng1,lat1;lng2,lat2?overview=polyline&steps=true
```

## Configuration

### Nepal-First Search

Currently configured to prioritize Nepal (countrycodes=np), but can be modified:

In `geocoding.ts`, `searchPlaces()` function:

```typescript
countrycodes: "np", // Change to "us", "gb", etc. or remove for global search
```

### Search Limit

Default is 5 suggestions, can be changed in components:

```typescript
searchPlaces(query, 8); // Return 8 results instead of 5
```

### OSRM Profile

Currently using "driving" profile, can change to:

- `walking` - Walking distance
- `cycling` - Cycling distance
- `driving` - Driving distance (default)

```typescript
// In routing.ts calculateRoute()
const url = `https://router.project-osrm.org/route/v1/walking/...`;
```

## Fallback Behavior

### If Nominatim Unavailable

- Search returns empty results
- User sees "No locations found" message
- User can still click "Start Navigation" with GPS location only

### If OSRM Unavailable

- Automatically falls back to `calculateSimpleDistance()`
- Uses Haversine formula (accurate but not following roads)
- Shows estimated duration based on 3 km/min average

### If Both Unavailable

- Still works with GPS-detected or manually entered coordinates
- Distance/duration estimates may be less accurate
- Route layer may not show actual roads

## Browser Compatibility

✅ Works in all modern browsers:

- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Autocomplete search is **debounced** (2 character minimum)
- Suggestions limited to **5 results** by default
- Route calculations cached when same coordinates selected
- No background requests until user types

## Future Enhancements

1. **Google Maps Places API** - More detailed place information
2. **Route alternatives** - Show multiple route options
3. **Live traffic** - Real-time traffic-aware routing
4. **Waypoints** - Multiple stops along the route
5. **Transport modes** - Walking, cycling, public transit options
6. **Offline mode** - Download maps and routes locally
7. **Route persistence** - Save favorite routes

## Troubleshooting

### Autocomplete not showing suggestions

- Check browser console for network errors
- Ensure Nominatim service is accessible: https://nominatim.openstreetmap.org/
- Try a longer search query (min 2 characters)

### Route calculation failing

- Check browser console for OSRM errors
- Verify coordinates are valid (lat -90 to 90, lng -180 to 180)
- Try OSRM demo: https://router.project-osrm.org/

### Wrong distance/duration shown

- Confirm GPS location is accurate
- Check selected place coordinates match expected location
- OSRM may calculate different routes than Google Maps

## Cost Analysis

**Completely FREE** 🎉

| Service   | Cost | No. of Requests | Monthly Cost |
| --------- | ---- | --------------- | ------------ |
| Nominatim | Free | Unlimited       | $0           |
| OSRM      | Free | Unlimited       | $0           |
| Total     |      |                 | **$0**       |

vs Google Maps API: ~$5-15 per 1000 geocoding requests + $1 per 1000 routing requests

## References

- **Nominatim**: https://nominatim.org/release-docs/latest/
- **OSRM**: http://project-osrm.org/
- **OpenStreetMap**: https://www.openstreetmap.org/
