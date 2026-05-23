import { ArrowRightLeft, ChevronDown, X, ArrowLeft, MapPin, Clock, Navigation } from "lucide-react";
import { useState, useRef } from "react";
import type { RouteOption } from "./AdvancedRouteLayer";

interface NavigationSidebarProps {
  startLocation: string;
  startAddress: string;
  endLocation: string;
  endAddress: string;
  route: RouteOption | null;
  onSwap: () => void;
  onChangeStart: (location: string, address: string) => void;
  onChangeEnd: (location: string, address: string) => void;
  transportMode: "driving" | "cycling" | "walking";
  onTransportModeChange: (mode: "driving" | "cycling" | "walking") => void;
  onClose: () => void;
}

const NavigationSidebar = ({
  startLocation,
  startAddress,
  endLocation,
  endAddress,
  route,
  onSwap,
  onChangeStart,
  onChangeEnd,
  transportMode,
  onTransportModeChange,
  onClose,
}: NavigationSidebarProps) => {
  const [editingStart, setEditingStart] = useState(false);
  const [editingEnd, setEditingEnd] = useState(false);
  const [startInput, setStartInput] = useState(startLocation);
  const [endInput, setEndInput] = useState(endLocation);
  const [startSuggestions, setStartSuggestions] = useState<Array<{ name: string; address: string }>>([]);
  const [endSuggestions, setEndSuggestions] = useState<Array<{ name: string; address: string }>>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate ETA based on duration
  const getETA = () => {
    if (!route) return "Calculating...";
    const durationMin = route.durationMinutes;
    const now = new Date();
    const eta = new Date(now.getTime() + durationMin * 60000);
    return eta.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query: string, isStart: boolean) => {
    if (query.length < 3) {
      isStart ? setStartSuggestions([]) : setEndSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
      );
      const data = await response.json();
      const suggestions = data.map((item: any) => ({
        name: item.name || item.display_name.split(",")[0],
        address: item.display_name,
      }));
      isStart ? setStartSuggestions(suggestions) : setEndSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleStartInputChange = (value: string) => {
    setStartInput(value);
    setShowStartSuggestions(true);

    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    startTimeoutRef.current = setTimeout(() => fetchSuggestions(value, true), 300);
  };

  const handleEndInputChange = (value: string) => {
    setEndInput(value);
    setShowEndSuggestions(true);

    if (endTimeoutRef.current) clearTimeout(endTimeoutRef.current);
    endTimeoutRef.current = setTimeout(() => fetchSuggestions(value, false), 300);
  };

  const handleSelectStartSuggestion = (name: string, address: string) => {
    setStartInput(name);
    onChangeStart(name, address);
    setShowStartSuggestions(false);
    setStartSuggestions([]);
  };

  const handleSelectEndSuggestion = (name: string, address: string) => {
    setEndInput(name);
    onChangeEnd(name, address);
    setShowEndSuggestions(false);
    setEndSuggestions([]);
  };

  const handleSaveStart = () => {
    onChangeStart(startInput, startAddress);
    setEditingStart(false);
    setShowStartSuggestions(false);
  };

  const handleSaveEnd = () => {
    onChangeEnd(endInput, endAddress);
    setEditingEnd(false);
    setShowEndSuggestions(false);
  };

  // Brand color accent
  const brandColor = "#A87DC2";

  return (
    <div className="fixed top-0 right-0 h-screen w-96 bg-white shadow-2xl z-40 overflow-hidden flex flex-col"
      style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}>
      
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0 sticky top-0">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
          title="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-gray-900">{endLocation}</h1>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Location Input Section - Premium Cards */}
        <div className="p-4 space-y-4 border-b border-gray-100 bg-gray-50">
          {/* Start Location Card */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">From</label>
            <div className="relative">
              {editingStart ? (
                <div className="flex gap-2">
                  <input
                    ref={startInputRef}
                    type="text"
                    value={startInput}
                    onChange={(e) => handleStartInputChange(e.target.value)}
                    placeholder="Search location"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition"
                    style={{ outlineColor: brandColor }}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveStart}
                    className="px-4 py-3 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition"
                    style={{ backgroundColor: brandColor }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingStart(true)}
                  className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" 
                      style={{ backgroundColor: "#D1FAE5" }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#10B981" }}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{startLocation}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{startAddress}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  </div>
                </button>
              )}

              {/* Start Suggestions Dropdown */}
              {showStartSuggestions && startSuggestions.length > 0 && editingStart && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {startSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectStartSuggestion(suggestion.name, suggestion.address)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition"
                    >
                      <p className="text-sm font-medium text-gray-900">{suggestion.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{suggestion.address}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Swap Button - Premium Style */}
          <div className="flex justify-center py-1">
            <button
              onClick={onSwap}
              className="p-2.5 rounded-full transition"
              style={{ backgroundColor: "#F3E8FF", color: brandColor }}
              title="Swap locations"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* End Location Card */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">To</label>
            <div className="relative">
              {editingEnd ? (
                <div className="flex gap-2">
                  <input
                    ref={endInputRef}
                    type="text"
                    value={endInput}
                    onChange={(e) => handleEndInputChange(e.target.value)}
                    placeholder="Search location"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition"
                    style={{ outlineColor: brandColor }}
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEnd}
                    className="px-4 py-3 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition"
                    style={{ backgroundColor: brandColor }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingEnd(true)}
                  className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: "#FEE2E2" }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#EF4444" }}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{endLocation}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{endAddress}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  </div>
                </button>
              )}

              {/* End Suggestions Dropdown */}
              {showEndSuggestions && endSuggestions.length > 0 && editingEnd && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {endSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectEndSuggestion(suggestion.name, suggestion.address)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition"
                    >
                      <p className="text-sm font-medium text-gray-900">{suggestion.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{suggestion.address}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transport Mode Pills - Modern Style */}
        <div className="p-4 border-b border-gray-100 flex gap-2">
          <button
            onClick={() => onTransportModeChange("driving")}
            className={`flex-1 py-3 px-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              transportMode === "driving"
                ? "text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={transportMode === "driving" ? { backgroundColor: brandColor } : {}}
            title="Driving"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M12 6c-3.31 0-6 2.69-6 6h2c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2-1 3-2 4v4h2c1-2 2-3 2-5 0-3.31-2.69-6-6-6z"/>
            </svg>
          </button>
          <button
            onClick={() => onTransportModeChange("cycling")}
            className={`flex-1 py-3 px-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center ${
              transportMode === "cycling"
                ? "text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={transportMode === "cycling" ? { backgroundColor: brandColor } : {}}
            title="Cycling"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.18 9l-3.64-6.35c-.15-.28-.46-.45-.78-.45H9c-.29 0-.56.13-.74.35L4.35 9H2c-.55 0-1 .45-1 1s.45 1 1 1h3.6l.89 1.55-1.29 1.29c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l2-2c.54-.54.77-1.39.54-2.15L9.41 8h2.38l3.97 4.95-2.41 1.41-2.6-3.24-1.5 1.5 3.6 4.5h-4.7V18h8v-2h2v-2h-2v-1.27L19.6 10H22c.55 0 1-.45 1-1s-.45-1-1-1h-3.82z"/>
            </svg>
          </button>
          <button
            onClick={() => onTransportModeChange("walking")}
            className={`flex-1 py-3 px-3 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center ${
              transportMode === "walking"
                ? "text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={transportMode === "walking" ? { backgroundColor: brandColor } : {}}
            title="Walking"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6.54 10c-.94-1.76-2.87-3-5.01-3-1.55 0-2.95.64-3.95 1.68.5 1.08 1.01 2.18 1.51 3.27.56 1.29.81 2.68.81 4.05v6H9v-5c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1v5H3v-6c0-1.37.25-2.76.81-4.05.5-1.09 1.01-2.19 1.51-3.27C4.05 9.64 2.65 9 1.1 9 .49 9 0 9.49 0 10.1s.49 1.1 1.1 1.1c1.37 0 2.69.66 3.51 1.8.74 1.01 1.39 2.11 1.92 3.25.47 1.02.71 2.12.71 3.25v5h3v-5c0-1.13.24-2.23.71-3.25.53-1.14 1.18-2.24 1.92-3.25.82-1.14 2.14-1.8 3.51-1.8.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1z"/>
            </svg>
          </button>
        </div>

        {/* Premium Route Summary Card */}
        {route && (
          <div className="m-4 p-4 rounded-xl border border-gray-100" style={{ backgroundColor: "#FAF5FF" }}>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4" style={{ color: brandColor }} />
                  <span className="text-xs font-semibold text-gray-600">ETA</span>
                </div>
                <p className="text-lg font-bold" style={{ color: brandColor }}>{getETA()}</p>
              </div>
              <div className="text-center border-l border-r border-gray-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <MapPin className="w-4 h-4" style={{ color: brandColor }} />
                  <span className="text-xs font-semibold text-gray-600">Distance</span>
                </div>
                <p className="text-lg font-bold" style={{ color: brandColor }}>{route.distance}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Navigation className="w-4 h-4" style={{ color: brandColor }} />
                  <span className="text-xs font-semibold text-gray-600">Time</span>
                </div>
                <p className="text-lg font-bold" style={{ color: brandColor }}>{route.duration}</p>
              </div>
            </div>
          </div>
        )}

        {/* Beautiful Turn-by-Turn Directions */}
        {route?.steps && route.steps.length > 0 && (
          <div className="p-4 space-y-3">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Directions</h3>
            <div className="space-y-2">
              {route.steps.map((step, idx) => {
                const distanceKm = (step.distance / 1000).toFixed(2);
                const durationMin = Math.round(step.duration / 60);

                return (
                  <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                      style={{ backgroundColor: brandColor }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {step.instruction}
                      </p>
                      {step.name && (
                        <p className="text-xs font-medium text-gray-600 mt-0.5">{step.name}</p>
                      )}
                      <div className="flex gap-3 mt-2 text-xs font-medium text-gray-500">
                        <span>{distanceKm} km</span>
                        <span>{durationMin} min</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="border-t border-gray-100 px-4 py-3 bg-white text-center flex-shrink-0 sticky bottom-0">
        <p className="text-xs text-gray-500 font-medium">Powered by OSRM & OpenStreetMap</p>
      </div>
    </div>
  );
};

export default NavigationSidebar;
