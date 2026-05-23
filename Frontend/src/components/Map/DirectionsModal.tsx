import { useState, useEffect } from "react";
import { MapPin, Navigation, X, Clock, MapIcon } from "lucide-react";

interface DirectionsModalProps {
  isOpen: boolean;
  destinationTitle: string;
  destinationAddress: string;
  destinationCity: string;
  onClose: () => void;
  onStartNavigation: (startLat: number, startLng: number, startLocation: string) => void;
}

const DirectionsModal = ({
  isOpen,
  destinationTitle,
  destinationAddress,
  destinationCity,
  onClose,
  onStartNavigation,
}: DirectionsModalProps) => {
  const [startLocation, setStartLocation] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsEnabled, setGpsEnabled] = useState(false);

  // Get current GPS location
  useEffect(() => {
    if (!isOpen || !useCurrentLocation) return;

    setLoading(true);
    setError(null);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLat(position.coords.latitude);
          setCurrentLng(position.coords.longitude);
          setGpsEnabled(true);
          setLoading(false);
        },
        (err) => {
          setError("Unable to get your location. Please enter a location manually.");
          setUseCurrentLocation(false);
          setLoading(false);
          console.error("GPS Error:", err);
        }
      );
    } else {
      setError("Geolocation not supported. Please enter a location manually.");
      setUseCurrentLocation(false);
      setLoading(false);
    }
  }, [isOpen, useCurrentLocation]);

  const handleStartNavigation = () => {
    if (useCurrentLocation) {
      if (currentLat !== null && currentLng !== null) {
        onStartNavigation(currentLat, currentLng, "Current Location");
      }
    } else {
      if (startLocation.trim()) {
        // For now, use default location. In production, you'd geocode this address
        // Using a default location in Kathmandu valley for demo
        onStartNavigation(27.7172, 85.324, startLocation);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center">
      {/* Modal */}
      <div className="w-full md:w-full max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-purple-100 p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5" style={{color: '#A987C8'}} />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Directions</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Destination Info */}
          <div className="bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-200">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase">Destination</p>
                <p className="text-lg md:text-xl font-bold text-gray-900 mt-1">
                  {destinationTitle}
                </p>
                <p className="text-sm text-gray-600 mt-1">{destinationAddress}</p>
                <p className="text-xs text-gray-500 mt-1">📍 {destinationCity}</p>
              </div>
            </div>
          </div>

          {/* Starting Point Selection */}
          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-900 uppercase">Starting Point</p>

            {/* Current Location Option */}
            <button
              onClick={() => {
                setUseCurrentLocation(true);
                setError(null);
              }}
              className={`w-full p-4 rounded-2xl border-2 transition-all ${
                useCurrentLocation
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    useCurrentLocation
                      ? "border-purple-500 bg-purple-500"
                      : "border-gray-300"
                  }`}
                >
                  {useCurrentLocation && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Navigation className="w-4 h-4" style={{color: '#A987C8'}} />
                    Use My Current Location
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {loading && "Getting your location..."}
                    {gpsEnabled && !loading && "📍 Location detected"}
                    {error && !useCurrentLocation && ""}
                  </p>
                </div>
              </div>
            </button>

            {/* Manual Location Option */}
            <button
              onClick={() => {
                setUseCurrentLocation(false);
                setError(null);
              }}
              className={`w-full p-4 rounded-2xl border-2 transition-all ${
                !useCurrentLocation
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                    !useCurrentLocation
                      ? "border-purple-500 bg-purple-500"
                      : "border-gray-300"
                  }`}
                >
                  {!useCurrentLocation && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapIcon className="w-4 h-4" style={{color: '#A987C8'}} />
                    Enter a Location
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Type your starting address
                  </p>
                </div>
              </div>
            </button>

            {/* Manual Location Input */}
            {!useCurrentLocation && (
              <input
                type="text"
                placeholder="Enter starting location (e.g., Kathmandu, Bhaktapur)"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900 placeholder-gray-500"
              />
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex gap-3">
              <div className="text-orange-600 flex-shrink-0 mt-0.5">⚠️</div>
              <p className="text-sm text-orange-900">{error}</p>
            </div>
          )}

          {/* Route Summary Preview */}
          {(useCurrentLocation && gpsEnabled) || (!useCurrentLocation && startLocation) && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-600 uppercase">Route Preview</p>
                <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                  <MapIcon className="w-4 h-4" />
                  2.5 km
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mb-2">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <p className="text-xs text-gray-600">Start</p>
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500 via-purple-500 to-red-500" />
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center mb-2">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs text-gray-600">Dest</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-300">
                <Clock className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-700">
                  Estimated time: <span className="font-semibold">8 mins</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Action Button */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 md:p-6">
          <button
            onClick={handleStartNavigation}
            disabled={
              loading ||
              (useCurrentLocation && (currentLat === null || currentLng === null)) ||
              (!useCurrentLocation && !startLocation.trim())
            }
            className="w-full py-4 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Getting location...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Start Navigation
              </>
            )}
          </button>
          <p className="text-xs text-gray-600 text-center mt-3">
            You can pan and zoom the map while navigating
          </p>
        </div>
      </div>
    </div>
  );
};

export default DirectionsModal;
