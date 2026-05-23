import { X } from "lucide-react";
import type { RouteOption } from "./AdvancedRouteLayer";

interface RouteInfoSidebarProps {
  route: RouteOption;
  destinationTitle: string;
  destinationAddress: string;
  onClose: () => void;
}

/**
 * Route Info Sidebar - displays route details and turn-by-turn directions
 * Shows on the right side of the navigation map
 */
const RouteInfoSidebar = ({
  route,
  destinationTitle,
  destinationAddress,
  onClose,
}: RouteInfoSidebarProps) => {
  return (
    <div className={`
      fixed top-0 right-0 h-screen bg-white shadow-2xl z-50 transition-all duration-300
      overflow-hidden flex flex-col
    `}
    style={{
      width: "384px",
      maxWidth: "90vw",
      boxShadow: "-2px 0 12px rgba(0,0,0,0.2)",
      right: 0,
      top: 0,
      height: "100vh",
    }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-900">Route Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Destination Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 flex-col justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Destination</p>
              <h3 className="font-semibold text-gray-900 text-sm mt-1">{destinationTitle}</h3>
              <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{destinationAddress}</p>
            </div>
          </div>
        </div>

        {/* Route Summary */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Distance</p>
              <p className="font-bold text-gray-900 text-lg mt-1">{route.distance}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Duration</p>
              <p className="font-bold text-gray-900 text-lg mt-1">{route.duration}</p>
            </div>
          </div>
        </div>

        {/* Turn-by-Turn Directions */}
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Step-by-Step Directions</h4>

          {route.steps && route.steps.length > 0 ? (
            <div className="space-y-3">
              {route.steps.map((step, idx) => {
                const distanceKm = (step.distance / 1000).toFixed(2);
                const durationMin = Math.round(step.duration / 60);

                return (
                  <div
                    key={idx}
                    className="flex gap-3 pb-3 border-b border-gray-100 last:border-0"
                  >
                    {/* Step Number */}
                    <div className="flex-shrink-0 w-8 h-8">
                      <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">
                          {idx + 1}
                        </span>
                      </div>
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-snug">
                        {step.instruction}
                      </p>
                      {step.name && (
                        <p className="text-xs text-gray-600 truncate font-medium mt-0.5">{step.name}</p>
                      )}
                      <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
                        <span>{distanceKm} km</span>
                        <span>{durationMin} min</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                Directions not available
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 bg-white text-center flex-shrink-0">
        <p className="text-xs text-gray-500">
          Powered by OSRM and OpenStreetMap
        </p>
      </div>
    </div>
  );
};

export default RouteInfoSidebar;
