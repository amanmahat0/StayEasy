import { useState, useEffect } from "react";
import { X, Navigation, ChevronRight, MapPin } from "lucide-react";

interface ActiveNavigationProps {
  destinationTitle: string;
  destinationAddress: string;
  destinationCity: string;
  distance: number; // in km
  duration: number; // in minutes
  onClose: () => void;
  currentStep: number;
  totalSteps: number;
}

const ActiveNavigation = ({
  destinationTitle,
  destinationAddress,
  destinationCity,
  distance,
  duration,
  onClose,
  currentStep = 1,
  totalSteps = 3,
}: ActiveNavigationProps) => {
  const [arrivalTime, setArrivalTime] = useState<string>("");

  useEffect(() => {
    // Calculate arrival time
    const now = new Date();
    const arrival = new Date(now.getTime() + duration * 60000);
    setArrivalTime(
      arrival.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );
  }, [duration]);

  const turns = [
    { instruction: "Head towards the destination", distance: 0.9 },
    { instruction: "Continue on main street", distance: 0.8 },
    { instruction: "Arrive at destination on the right", distance: 0.8 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 md:top-0 md:left-auto md:w-96 z-[9998] h-screen md:h-full bg-white shadow-2xl flex flex-col overflow-hidden rounded-t-3xl md:rounded-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 md:p-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <Navigation className="w-5 h-5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs opacity-90 truncate">Navigation Active</p>
            <p className="text-lg font-bold truncate">{destinationTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-purple-500 rounded-lg transition flex-shrink-0"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Route Summary */}
      <div className="bg-purple-50 px-4 md:px-5 py-4 border-b border-purple-100 flex-shrink-0">
        <div className="flex items-center gap-6 mb-3">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{distance}</p>
            <p className="text-xs text-gray-600 mt-1">km</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{duration}</p>
            <p className="text-xs text-gray-600 mt-1">min</p>
          </div>
          <div className="text-right flex-1">
            <p className="text-xs text-gray-600">Arrive by</p>
            <p className="text-lg font-bold text-gray-900">{arrivalTime}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-xs font-semibold text-gray-600">
            {currentStep}/{totalSteps}
          </p>
        </div>
      </div>

      {/* Current Turn - Large Display */}
      <div className="bg-gradient-to-b from-white to-gray-50 px-4 md:px-5 py-6 border-b border-gray-200 flex-shrink-0">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Current Direction</p>
        <p className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          {turns[0]?.instruction || "Follow the route"}
        </p>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <p className="text-sm text-gray-600">
            {turns[0]?.distance} km to next turn
          </p>
        </div>
      </div>

      {/* Turn-by-Turn List */}
      <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Upcoming Turns</p>
        <div className="space-y-3">
          {turns.map((turn, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                idx === 0
                  ? "bg-purple-50 border-2 border-purple-300"
                  : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                  idx === 0
                    ? "bg-purple-600 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{turn.instruction}</p>
                <p className="text-xs text-gray-600 mt-1">{turn.distance} km</p>
              </div>
              {idx === 0 && (
                <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: '#A987C8'}} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Destination Info */}
      <div className="bg-gray-50 border-t border-gray-200 p-4 md:p-5 flex-shrink-0">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Destination</p>
        <div className="bg-white rounded-xl p-3 border border-gray-200">
          <p className="font-bold text-gray-900 text-sm">{destinationTitle}</p>
          <p className="text-xs text-gray-600 mt-1">{destinationAddress}</p>
          <p className="text-xs text-gray-500 mt-1">📍 {destinationCity}</p>
        </div>
      </div>
    </div>
  );
};

export default ActiveNavigation;
