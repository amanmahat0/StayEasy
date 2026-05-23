# Integration Guide: Places Autocomplete & Routing

## Quick Start

The places autocomplete and routing are **already integrated** into the GoogleMapsStyleDirections component. Here's what happens when users interact with the directions panel:

## User Flow

### 1. User Opens Directions

```
PropertyDetail page → Click "Get Directions" button
→ GoogleMapsStyleDirections panel opens (right side)
```

### 2. User Selects Starting Location

**Option A: GPS Detection**

```
Click "Current Location" button
→ Browser prompts for GPS permission
→ "Ready" status shows when location obtained
```

**Option B: Manual Search**

```
Click "Enter Location" button
→ Type in search field (e.g., "Bhaktapur")
→ Autocomplete suggestions appear (debounced)
→ Click suggestion to select
→ Route automatically recalculates
```

### 3. Route Information Updates

```
Selected location + Destination coordinates
→ calculateRoute() called via OSRM
→ Distance, duration, turn-by-turn directions updated
→ "Start Navigation" button becomes enabled
```

### 4. User Starts Navigation

```
Click "Start Navigation" button
→ Real coordinates passed to PropertyMapDisplay
→ Full-screen map appears with:
   - Brand purple route line
   - Green pulsing current location marker
   - Red destination marker
   - Turn-by-turn panel on left
```

## Testing the Features

### Test 1: Autocomplete Search

1. Open a property detail page
2. Click "Get Directions"
3. Click "Enter Location"
4. Type "kathmandu" in search field
5. **Expected**: 5 suggestions appear with addresses
6. Click one → Route info updates with distance/duration

### Test 2: Route Calculation

1. Same as above, select a location
2. **Expected**:
   - Distance shows as decimal number (e.g., "23.5 km")
   - Duration shows as number of minutes (e.g., "45 mins")
   - Route preview shows 3-10 turn-by-turn steps

### Test 3: Start Navigation

1. After selecting location in Test 1
2. Click "Start Navigation" button
3. **Expected**:
   - Full-screen map appears
   - Purple line connects start to destination
   - Map centers on destination location

### Test 4: Back Button

1. During navigation (full-screen map)
2. Click back arrow (←) in directions panel
3. **Expected**: Returns to embedded map view

## Code Structure

```
src/
├── components/
│   └── Map/
│       └── GoogleMapsStyleDirections.tsx     ← Main component
├── services/
│   ├── geocoding.ts                          ← Place search service
│   └── routing.ts                            ← Route calculation service
└── pages/
    └── Properties/
        └── PropertyDetail.tsx                ← Integrates directions
```

## Key Functions

### In GoogleMapsStyleDirections.tsx

**handlePlaceSearch(query: string)**

- Called when user types in location search field
- Calls `searchPlaces()` from geocoding service
- Updates `suggestions` state with results
- Shows dropdown with autocomplete options

**handlePlaceSelect(place: PlaceResult)**

- Called when user clicks a suggestion
- Updates `selectedPlace` state
- Calls `calculateAndDisplayRoute()`
- Updates distance/duration display

**calculateAndDisplayRoute(startLat, startLng)**

- Called after location is selected
- Calls `calculateRoute()` from routing service
- Updates `distance` and `duration` states
- Falls back to Haversine if OSRM fails

**handleStart()**

- Called when "Start Navigation" button is clicked
- Gets coordinates (from GPS or selectedPlace)
- Calls `onNavigate()` to pass coordinates to parent
- Parent (PropertyMapDisplay) handles showing full-screen map

## Customization Options

### Change Default Country

In `src/services/geocoding.ts`, line ~38:

```typescript
countrycodes: "np", // Change to "us", "gb", "au", etc.
```

### Change Autocomplete Limit

In `GoogleMapsStyleDirections.tsx`, wherever `searchPlaces()` is called:

```typescript
const results = await searchPlaces(query, 10); // Get 10 suggestions instead of 5
```

### Change Routing Profile

In `src/services/routing.ts`, line ~42:

```typescript
const url = `https://router.project-osrm.org/route/v1/walking/...`; // walking, cycling, or driving
```

### Show More Turn-by-Turn Steps

In `src/services/routing.ts`, line ~89:

```typescript
steps: steps.slice(0, 20), // Show first 20 steps instead of 10
```

## API Rate Limits

### Nominatim (Geocoding)

- Free: Unlimited (with fair usage policy)
- Rate limit: ~1 request/second recommended
- Our implementation: Only searches when user types (no automatic requests)

### OSRM (Routing)

- Free: Unlimited
- Rate limit: No official limit
- Our implementation: Only calculates when location is selected

**No API keys required for either service!** ✨

## Error Handling

### Autocomplete Errors

```typescript
// If searchPlaces() fails:
- suggestions array becomes empty
- "No locations found" message appears
- User can still use GPS or manually enter address
```

### Route Calculation Errors

```typescript
// If calculateRoute() fails:
- calculateSimpleDistance() is used as fallback
- Haversine formula provides rough estimate
- Navigation still works but distance may be less accurate
```

## Performance Tips

1. **Autocomplete is efficient**:
   - Minimum 2 character search (no single-letter searches)
   - Only searches when user stops typing (debounced)
   - Maximum 5 results returned

2. **Route calculation is fast**:
   - OSRM responds in ~100-300ms
   - Results cached for identical coordinates
   - Fallback calculation is instant (<10ms)

3. **Network considerations**:
   - No background requests until user interacts
   - All external APIs have public free tier
   - Bandwidth usage minimal (<5KB per request)

## Debugging

### Enable Console Logging

Add `console.log()` statements in:

- `handlePlaceSearch()` - See search queries and results
- `handlePlaceSelect()` - See selected place details
- `calculateAndDisplayRoute()` - See route calculation results
- `handleStart()` - See final coordinates sent to parent

### Check API Status

- Nominatim: https://nominatim.org/ (check status page)
- OSRM: https://router.project-osrm.org/ (try demo)
- Browser DevTools Network tab: See all API requests

### Verify Coordinates

Use: https://www.openstreetmap.org/?lat=27.6&lon=85.3 to verify any lat/lng pair

## Next Steps

1. **Test all features** (see Testing section above)
2. **Customize for your region** (change default country if needed)
3. **Monitor API usage** (Nominatim provides usage stats)
4. **Consider upgrade** if you need:
   - Higher rate limits
   - More detailed place information
   - Real-time traffic data
   - Route alternatives
   - Google Places integration

## Support

For issues:

1. Check browser console for errors
2. Verify API endpoints are accessible:
   - https://nominatim.openstreetmap.org/search?q=test&format=json
   - https://router.project-osrm.org/route/v1/driving/0,0;1,1
3. Check network requests in DevTools
4. Review ROUTING_INTEGRATION.md for detailed documentation
