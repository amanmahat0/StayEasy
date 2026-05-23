import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { Navigation } from "lucide-react";
import { getCityCoordinates, getCityZoomLevel } from "../../utils/cityCoordinates";
import RouteLayer from "./RouteLayer";
import AdvancedRouteLayer, { type RouteOption } from "./AdvancedRouteLayer";
import NavigationSidebar from "./NavigationSidebar";
import GoogleMapsStyleDirections from "./GoogleMapsStyleDirections";

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom styled marker for property
const customMarker = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface PropertyMapDisplayProps {
  latitude?: number;
  longitude?: number;
  propertyTitle?: string;
  city?: string;
  address?: string;
}

interface MapContentProps extends PropertyMapDisplayProps {
  isFullscreen?: boolean;
}

// Map content component - reusable for both normal and fullscreen views
const MapContent = ({
  latitude,
  longitude,
  propertyTitle = "Property Location",
  city,
  address = "",
  isFullscreen = false,
}: MapContentProps) => {
  // isFullscreen prop is for type consistency but not used in rendering
  (isFullscreen);
  
  // Use provided coordinates OR get from city, with fallback to Kathmandu
  const cityCoords = getCityCoordinates(city);
  const lat = latitude && !isNaN(latitude) ? latitude : cityCoords.latitude;
  const lng = longitude && !isNaN(longitude) ? longitude : cityCoords.longitude;
  const zoomLevel = getCityZoomLevel(city);

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoomLevel}
      style={{
        height: "100%",
        width: "100%",
        zIndex: 1,
      }}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      dragging={true}
      zoomControl={true}
    >
      {/* OpenStreetMap tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {/* Route from current location to destination with brand color */}
      {isFullscreen && (
        <RouteLayer
          startLat={27.7172}
          startLng={85.324}
          endLat={lat}
          endLng={lng}
          brandColor="#A87DC2"
          showCurrentLocation={true}
        />
      )}

      {/* Property marker with popup */}
      <Marker position={[lat, lng]} icon={customMarker}>
        <Popup closeButton={true} autoClose={false}>
          <div className="text-center min-w-max">
            <div className="font-bold text-gray-900 text-sm mb-1">
              {propertyTitle}
            </div>
            {city && (
              <div className="text-xs text-gray-600 mb-1">📍 {city}</div>
            )}
            {address && (
              <div className="text-xs text-gray-500">{address}</div>
            )}
            <div className="text-xs text-gray-400 mt-2">
              Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
            </div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

const PropertyMapDisplay = (props: PropertyMapDisplayProps) => {
  const [showDirections, setShowDirections] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [startLat, setStartLat] = useState<number | null>(null);
  const [startLng, setStartLng] = useState<number | null>(null);
  const [startLocationName] = useState("Current Location");
  const [startLocationAddress] = useState("Getting location...");
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [transportMode, setTransportMode] = useState<"driving" | "cycling" | "walking">("driving");

  // Get city coordinates for destination
  const cityCoords = getCityCoordinates(props.city);
  const destLat = props.latitude || cityCoords.latitude;
  const destLng = props.longitude || cityCoords.longitude;

  const handleOpenDirections = () => {
    setShowDirections(true);
  };

  const handleNavigate = (lat: number, lng: number) => {
    console.log("Navigation started with:", { lat, lng, destLat, destLng });
    setStartLat(lat);
    setStartLng(lng);
    setIsNavigating(true);
    setShowDirections(false);
  };

  const handleCloseNavigation = () => {
    console.log("Closing navigation");
    setShowDirections(false);
    setIsNavigating(false);
    setStartLat(null);
    setStartLng(null);
    setRoutes([]);
    setSelectedRouteIndex(0);
  };

  const handleRoutesLoaded = (loadedRoutes: RouteOption[]) => {
    console.log("Routes loaded:", loadedRoutes);
    setRoutes(loadedRoutes);
    setSelectedRouteIndex(0);
  };

  const handleSwapLocations = () => {
    console.log("Swapping locations");
    // Swap start and destination - for now just a placeholder
    // Full implementation would require backend to support multiple destinations
    console.log("Swap functionality - to be implemented with multi-stop routing");
  };

  const handleChangeStart = (location: string, address: string) => {
    console.log("Start location changed to:", location, address);
    // Could update startLat/startLng based on geocoding result
  };

  const handleChangeEnd = (location: string, address: string) => {
    console.log("Destination location changed to:", location, address);
    // Could update destLat/destLng based on geocoding result
  };

  const handleTransportModeChange = (mode: "driving" | "cycling" | "walking") => {
    console.log("Transport mode changed to:", mode);
    setTransportMode(mode);
    // Could recalculate route based on transport mode
  };

  return (
    <>
      {/* Normal View - Embedded Map */}
      <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-lg">
        <MapContent {...props} isFullscreen={false} />

        {/* Directions Button */}
        <button
          onClick={handleOpenDirections}
          className="absolute top-4 right-4 z-50 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:shadow-xl"
          title="Get directions"
          aria-label="Get directions to property"
        >
          <Navigation className="w-5 h-5" />
        </button>

        {/* Attribution text */}
        <div className="absolute bottom-0 left-0 right-0 text-xs text-gray-400 p-2 bg-white bg-opacity-80 text-center pointer-events-none">
          © OpenStreetMap contributors
        </div>
      </div>

      {/* Full Screen Navigation View */}
      {isNavigating && startLat !== null && startLng !== null && (
        <div className="fixed inset-0 z-[10000] flex bg-white">
          {/* Map Container - takes remaining width with right margin for sidebar */}
          <div className="flex-1 relative" style={{ marginRight: "384px" }}>
            <MapContainer
              center={[destLat, destLng]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
                maxZoom={19}
              />

              {/* Advanced route layer with polyline */}
              <AdvancedRouteLayer
                startLat={startLat}
                startLng={startLng}
                endLat={destLat}
                endLng={destLng}
                brandColor="#A87DC2"
                secondaryColor="#D0B3E3"
                onRoutesLoaded={handleRoutesLoaded}
                selectedRouteIndex={selectedRouteIndex}
                showAlternateRoutes={true}
              />

              {/* Destination Marker */}
              <Marker position={[destLat, destLng]}>
                <Popup>
                  <div className="text-center text-sm">
                    <strong>{props.propertyTitle}</strong>
                    <p>{props.city}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>

          {/* Right Sidebar - Navigation Controls */}
          <NavigationSidebar
            startLocation={startLocationName}
            startAddress={startLocationAddress}
            endLocation={props.propertyTitle || "Destination"}
            endAddress={props.address || ""}
            route={routes.length > 0 ? routes[selectedRouteIndex] : null}
            onSwap={handleSwapLocations}
            onChangeStart={handleChangeStart}
            onChangeEnd={handleChangeEnd}
            transportMode={transportMode}
            onTransportModeChange={handleTransportModeChange}
            onClose={handleCloseNavigation}
          />
        </div>
      )}

      {/* Directions Input Panel */}
      {showDirections && !isNavigating && (
        <GoogleMapsStyleDirections
          isOpen={true}
          destinationTitle={props.propertyTitle || "Destination"}
          destinationAddress={props.address || ""}
          destinationLat={destLat}
          destinationLng={destLng}
          onClose={handleCloseNavigation}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
};

export default PropertyMapDisplay;
