import { Clock, MapPin, Navigation, ChevronUp, X } from "lucide-react";
import { useState } from "react";

interface FloatingNavigationBarProps {
  destinationTitle?: string;
  destinationAddress?: string;
  distance?: number; // in km
  duration?: number; // in minutes
  currentTurn?: string;
  nextTurn?: string;
  onClose?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

/**
 * Floating navigation bar - Google Maps style
 * Minimal, clean, always visible during navigation
 */
const FloatingNavigationBar = ({
  destinationTitle = "Destination",
  destinationAddress = "Address",
  distance = 2.5,
  duration = 8,
  currentTurn = "Head towards main road",
  nextTurn = "Turn right on main street",
  onClose,
  currentStep = 1,
  totalSteps = 3,
}: FloatingNavigationBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format remaining time
  const getTimeColor = () => {
    if (duration <= 5) return "text-red-600";
    if (duration <= 10) return "text-amber-600";
    return "text-green-600";
  };

  // Calculate progress percentage
  const progress = (currentStep / totalSteps) * 100;

  return (
    <>
      {/* Floating Navigation Bar - Compact View (Default) */}
      {!isExpanded && (
        <div className="fixed top-4 right-4 z-50 max-w-sm nav-float-enter">
          {/* Main Navigation Card */}
          <div className="glass-effect rounded-2xl shadow-2xl overflow-hidden">
            {/* Top Section - Current Direction */}
            <div className="bg-gradient-to-r from-[#A87DC2] to-[#8B5FA3] p-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {/* Current Turn - Large and Clear */}
                  <p className="text-sm font-medium opacity-90 mb-1">TURN-BY-TURN</p>
                  <p className="text-lg font-bold leading-tight mb-3">
                    {currentTurn}
                  </p>

                  {/* Next Turn - Small Preview */}
                  {nextTurn && (
                    <div className="bg-white/20 rounded-lg p-2 text-xs">
                      <p className="opacity-90">Next: {nextTurn}</p>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors nav-button-hover"
                    aria-label="Close navigation"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Middle Section - Distance & Time */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-3">
                {/* Distance */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold">DISTANCE</p>
                  <p className="text-xl font-bold text-gray-900">
                    {distance}
                    <span className="text-sm font-normal text-gray-600 ml-0.5">km</span>
                  </p>
                </div>

                {/* Divider */}
                <div className="w-px h-12 bg-gray-300" />

                {/* Time */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold">ETA</p>
                  <p className={`text-xl font-bold ${getTimeColor()}`}>
                    <Clock className="w-4 h-4 inline-block mr-1" />
                    {duration}
                    <span className="text-sm font-normal text-gray-600 ml-0.5">min</span>
                  </p>
                </div>
              </div>

              {/* Expand Button */}
              <button
                onClick={() => setIsExpanded(true)}
                className="flex-shrink-0 bg-[#A87DC2] hover:bg-[#8B5FA3] text-white rounded-full p-2.5 transition-all hover:shadow-lg nav-button-hover"
                aria-label="Expand navigation details"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-[#A87DC2] to-[#8B5FA3] transition-all duration-300 progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Info Text */}
          <p className="text-xs text-gray-600 text-center mt-2 font-medium">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#A87DC2] to-[#8B5FA3] text-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-90">NAVIGATING TO</p>
                  <h2 className="text-2xl font-bold mt-1">{destinationTitle}</h2>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
                  aria-label="Close expanded view"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  <span>
                    {distance}
                    <span className="text-xs ml-1">km</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {duration}
                    <span className="text-xs ml-1">min</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Current Direction - Large */}
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-2">
                  Current Instruction
                </p>
                <div className="bg-gradient-to-br from-[#A87DC2]/10 to-[#8B5FA3]/10 border-2 border-[#A87DC2] rounded-2xl p-6">
                  <p className="text-2xl font-bold text-gray-900">{currentTurn}</p>
                </div>
              </div>

              {/* Upcoming Turns */}
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-3">
                  Upcoming Turns
                </p>

                {/* Turn 1 */}
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#A87DC2] text-white flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                  </div>
                  <div className="flex-1 py-2">
                    <p className="font-semibold text-gray-900">{nextTurn}</p>
                    <p className="text-sm text-gray-600 mt-1">~0.8 km away</p>
                  </div>
                </div>

                {/* Turn 2 */}
                <div className="flex gap-4 mb-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                  </div>
                  <div className="flex-1 py-2">
                    <p className="font-semibold text-gray-900">Continue straight</p>
                    <p className="text-sm text-gray-600 mt-1">~1.2 km away</p>
                  </div>
                </div>

                {/* Turn 3 - Destination */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1 py-2">
                    <p className="font-semibold text-gray-900">Arrive at destination</p>
                    <p className="text-sm text-gray-600 mt-1">{destinationTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">{destinationAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-6">
              <button
                onClick={() => setIsExpanded(false)}
                className="w-full bg-[#A87DC2] hover:bg-[#8B5FA3] text-white font-bold py-3 rounded-xl transition-colors"
              >
                Back to Compact View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingNavigationBar;
