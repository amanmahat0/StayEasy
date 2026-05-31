import { useState, useEffect } from "react";
import { Header } from "../../components/admin/Header";
import { Package, Loader2, Edit2 } from "lucide-react";
import API from "../../services/api";
import { API_BASE } from "../../config";

interface Booking {
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
    images: Array<{ id: number; image: string }>;
  };
  check_in: string;
  check_out: string;
  total_price: number;
  status: "pending" | "processing" | "confirmed" | "completed" | "cancelled";
  payment_status: string;
  payment_type: string;
  created_at: string;
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  // Fetch Bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("admin/bookings/");
      const data = response.data;
      setBookings(Array.isArray(data) ? data : (data.results || []));
    } catch (err: any) {
      let errorMessage = "Failed to fetch bookings";
      
      if (err.response?.status === 401) {
        errorMessage = "Unauthorized: Invalid or expired token. Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Forbidden: Admin access required.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update Booking Status
  const updateBookingStatus = async (bookingId: number) => {
    if (!newStatus) return;

    try {
      await API.patch(`admin/bookings/${bookingId}/update-status/`, { 
        status: newStatus 
      });
      setEditingId(null);
      fetchBookings(); // Refresh list
    } catch (err: any) {
      let errorMessage = "Failed to update booking status";
      
      if (err.response?.status === 401) {
        errorMessage = "Unauthorized: Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Forbidden: Admin access required.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error("Failed to update booking:", err);
      alert(errorMessage);
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
      case "pending":
      case "processing":
        return "bg-purple-100 text-purple-800";
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
      case "pending":
      case "processing":
        return "🟣";
      default:
        return "⚪";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Package className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
              <p className="text-gray-600 mt-1">View and manage all bookings in the system</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-purple-600 text-sm font-medium">🟣 Processing</p>
            <p className="text-2xl font-bold text-purple-600">
              {bookings.filter((b) => b.status === "pending" || b.status === "processing").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-green-600 text-sm font-medium">🟢 Confirmed</p>
            <p className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.status === "confirmed").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-blue-600 text-sm font-medium">🔵 Completed</p>
            <p className="text-2xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === "completed").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-red-600 text-sm font-medium">🔴 Cancelled</p>
            <p className="text-2xl font-bold text-red-600">
              {bookings.filter((b) => b.status === "cancelled").length}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600 mb-4" />
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        )}

        {/* Bookings List */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition"
              >
                <div className="grid grid-cols-12 gap-6">
                  {/* Property Image */}
                  <div className="col-span-2">
                    {booking.property_info.images[0] ? (
                      <img
                        src={`${API_BASE}${booking.property_info.images[0].image}`}
                        alt={booking.property_info.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="col-span-7">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {booking.property_info.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      📍 {booking.property_info.address}, {booking.property_info.city}
                    </p>

                    {/* Tenant Info */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <p className="text-sm font-medium text-gray-900">
                        Tenant: {booking.user_info.first_name} {booking.user_info.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Email: {booking.user_info.email}
                      </p>
                    </div>

                    {/* Dates and Price */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs font-medium">CHECK-IN</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.check_in).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-medium">CHECK-OUT</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(booking.check_out).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs font-medium">TOTAL PRICE</p>
                        <p className="font-semibold text-gray-900">Rs {booking.total_price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="col-span-3 flex flex-col items-end justify-between">
                    {/* Status Badge */}
                    {editingId === booking.id ? (
                      <div className="flex flex-col gap-2 w-full">
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Select Status</option>
                          <option value="pending">Processing</option>
                          <option value="processing">Processing</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookingStatus(booking.id)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadgeColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
                        </span>
                        <button
                          onClick={() => {
                            setEditingId(booking.id);
                            setNewStatus(booking.status);
                          }}
                          className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                        >
                          <Edit2 size={16} />
                          Change Status
                        </button>
                      </>
                    )}

                    {/* Booking ID */}
                    <div className="mt-4 text-right">
                      <p className="text-gray-500 text-xs">Booking ID</p>
                      <p className="font-bold text-gray-900">#{booking.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && bookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Package className="inline-block text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;