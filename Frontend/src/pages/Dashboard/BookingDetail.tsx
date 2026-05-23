import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, X } from "lucide-react";

interface BookingDetail {
  id: number;
  user_info: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  property_info: {
    id: number;
    title: string;
    address: string;
    city: string;
    price: number;
    property_type: string;
    description: string;
    images: Array<{ id: number; image: string }>;
  };
  check_in: string;
  check_out: string;
  total_price: number;
  status: "confirmed" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const API_BASE = "http://localhost:8000/api/users";

  // Fetch Booking Detail
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await axios.get(`${API_BASE}/bookings/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooking(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Failed to fetch booking details"
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBooking();
  }, [id]);

  // Cancel Booking
  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setCancelling(true);
    try {
      const token = localStorage.getItem("access");
      await axios.patch(
        `${API_BASE}/bookings/${id}/cancel/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh booking details
      const response = await axios.get(`${API_BASE}/bookings/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooking(response.data);
      alert("Booking cancelled successfully");
    } catch (err: any) {
      alert("Failed to cancel booking");
      console.error(err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate("/my-bookings")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back to My Bookings
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 text-center">
            {error || "Booking not found"}
          </div>
        </div>
      </div>
    );
  }

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
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/my-bookings")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to My Bookings
        </button>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Details
            </h1>
            <p className="text-gray-600">Booking #{booking.id}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(
              booking.status
            )}`}
          >
            {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Property Image */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {booking.property_info.images[0] ? (
                <img
                  src={`http://localhost:8000${booking.property_info.images[0].image}`}
                  alt={booking.property_info.title}
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="w-full h-80 bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600">No image available</span>
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {booking.property_info.title}
              </h2>
              <p className="text-gray-600 mb-4">
                📍 {booking.property_info.address}, {booking.property_info.city}
              </p>
              <p className="text-gray-700">{booking.property_info.description}</p>

              <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Property Type</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {booking.property_info.property_type}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Price per Night</p>
                  <p className="font-semibold text-gray-900">
                    Rs {booking.property_info.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Owner</p>
                  <p className="font-semibold text-gray-900">Contact landlord</p>
                </div>
              </div>
            </div>

            {/* Booking Dates */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Dates</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-2">CHECK-IN</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date(booking.check_in).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {new Date(booking.check_in).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-2">CHECK-OUT</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date(booking.check_out).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {new Date(booking.check_out).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-500 text-sm font-medium mb-1">Duration</p>
                <p className="text-lg font-semibold text-gray-900">
                  {Math.ceil(
                    (new Date(booking.check_out).getTime() -
                      new Date(booking.check_in).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  nights
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tenant Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tenant Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Name</p>
                  <p className="font-semibold text-gray-900">
                    {booking.user_info.first_name} {booking.user_info.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Email</p>
                  <p className="font-semibold text-gray-900 break-all">
                    {booking.user_info.email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Username</p>
                  <p className="font-semibold text-gray-900">
                    @{booking.user_info.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Price Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Rs {booking.property_info.price.toLocaleString()} × {Math.ceil(
                      (new Date(booking.check_out).getTime() -
                        new Date(booking.check_in).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    nights
                  </span>
                  <span className="font-semibold text-gray-900">
                    Rs {booking.total_price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    Rs {booking.total_price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-sm">
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Booked on:</span> {new Date(booking.created_at).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Last updated:</span> {new Date(booking.updated_at).toLocaleDateString()}
              </p>
            </div>

            {/* Cancel Button */}
            {booking.status !== "completed" && booking.status !== "cancelled" && (
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                <X size={18} />
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            )}

            {booking.status === "cancelled" && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
                <p className="text-red-700 font-medium">This booking has been cancelled</p>
              </div>
            )}

            {booking.status === "completed" && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
                <p className="text-blue-700 font-medium">This booking is completed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
