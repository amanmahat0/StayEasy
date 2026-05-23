import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Package, Loader2, Eye } from "lucide-react";

interface Booking {
  id: number;
  property_info: {
    id: number;
    title: string;
    address: string;
    city: string;
    price: number;
    images: Array<{ id: number; image: string }>;
  };
  check_in: string;
  check_out: string;
  total_price: number;
  status: "confirmed" | "completed" | "cancelled";
  created_at: string;
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8000/api/users";

  // Fetch User Bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access");
      const response = await axios.get(`${API_BASE}/bookings/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter for unique bookings (in case of duplicates)
      const uniqueBookings = Array.from(
        new Map((response.data.results || []).map((b: Booking) => [b.id, b])).values()
      ) as Booking[];
      setBookings(uniqueBookings);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return "🟢";
      case "completed":
        return "🔵";
      case "cancelled":
        return "🔴";
      default:
        return "⚪";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-blue-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">My Bookings</h1>
          </div>
          <p className="text-gray-600">View and manage your property bookings</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600 mb-4" />
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        )}

        {/* Bookings Grid */}
        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {booking.property_info.images[0] ? (
                    <img
                      src={`http://localhost:8000${booking.property_info.images[0].image}`}
                      alt={booking.property_info.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <span className="text-gray-600">No image available</span>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                        booking.status
                      )}`}
                    >
                      {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {booking.property_info.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    📍 {booking.property_info.address}, {booking.property_info.city}
                  </p>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase">Check-in</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.check_in).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium uppercase">Check-out</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.check_out).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-gray-500 text-xs font-medium uppercase">Total Price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      Rs {booking.total_price.toLocaleString()}
                    </p>
                  </div>

                  {/* Booking ID and Date */}
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                    <span>Booking #{booking.id}</span>
                    <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => navigate(`/booking/${booking.id}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Eye size={18} />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Package className="inline-block text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">You haven't made any bookings yet</p>
            <button
              onClick={() => navigate("/properties")}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Browse Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
