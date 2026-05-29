import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, X, AlertCircle, CheckCircle2 } from "lucide-react";

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

interface RefundInfo {
  refund_amount: number;
  refund_percentage: number;
  policy_applied: string;
}

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [refundInfo, setRefundInfo] = useState<RefundInfo | null>(null);
  const [cancellationSuccess, setCancellationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  // Calculate refund when modal opens
  const handleOpenCancellationModal = () => {
    if (!booking) return;

    // Calculate refund based on cancellation policy
    const daysUntilCheckin = Math.ceil(
      (new Date(booking.check_in).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    let refundAmount = booking.total_price;
    let refundPercentage = 100;
    let policyApplied = "";

    if (daysUntilCheckin >= 7) {
      // Full refund (7+ days before check-in)
      refundAmount = booking.total_price;
      refundPercentage = 100;
      policyApplied = "Full refund (7+ days before check-in)";
    } else if (daysUntilCheckin >= 3) {
      // 50% refund (3-6 days before check-in)
      refundAmount = booking.total_price * 0.5;
      refundPercentage = 50;
      policyApplied = `50% refund (${daysUntilCheckin} days before check-in)`;
    } else {
      // No refund (less than 3 days before check-in)
      refundAmount = 0;
      refundPercentage = 0;
      policyApplied = `No refund (${daysUntilCheckin} days before check-in)`;
    }

    setRefundInfo({
      refund_amount: refundAmount,
      refund_percentage: refundPercentage,
      policy_applied: policyApplied,
    });
    setShowCancellationModal(true);
  };

  // Cancel Booking
  const handleConfirmCancellation = async () => {
    if (!booking || !refundInfo) return;

    setCancelling(true);
    try {
      const token = localStorage.getItem("access");
      const response = await axios.post(
        `${API_BASE}/bookings/${id}/cancel/`,
        { reason: "User requested cancellation" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Set success state
      setSuccessMessage(response.data.message);
      setCancellationSuccess(true);
      setShowCancellationModal(false);

      // Update booking details
      setBooking({
        ...booking,
        status: "cancelled",
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setCancellationSuccess(false);
      }, 5000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error || "Failed to cancel booking";
      alert(errorMsg);
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

  const daysUntilCheckin = Math.ceil(
    (new Date(booking.check_in).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

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

        {/* Success Message */}
        {cancellationSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-green-900">{successMessage}</p>
              <p className="text-sm text-green-700 mt-1">
                Your refund will be processed within 5-7 business days.
              </p>
            </div>
          </div>
        )}

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
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Tenant Information
              </h3>
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Price Summary
              </h3>
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
                <span className="font-medium">Booked on:</span>{" "}
                {new Date(booking.created_at).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Last updated:</span>{" "}
                {new Date(booking.updated_at).toLocaleDateString()}
              </p>
              {booking.status === "confirmed" && (
                <p className="text-blue-600 mt-3 font-medium">
                  {daysUntilCheckin > 0
                    ? `${daysUntilCheckin} days until check-in`
                    : "Check-in is today!"}
                </p>
              )}
            </div>

            {/* Cancel Button */}
            {booking.status === "confirmed" && (
              <button
                onClick={handleOpenCancellationModal}
                disabled={cancelling}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                <X size={18} />
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            )}

            {booking.status === "cancelled" && (
              <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
                <p className="text-red-700 font-medium">
                  This booking has been cancelled
                </p>
              </div>
            )}

            {booking.status === "completed" && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
                <p className="text-blue-700 font-medium">
                  This booking is completed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancellationModal && refundInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-200 p-6">
              <h2 className="text-xl font-bold text-red-900">Cancel Booking?</h2>
              <p className="text-red-700 text-sm mt-2">
                Please review the cancellation details below
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {booking.property_info.title}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(booking.check_in).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(booking.check_out).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Total Amount Paid:</span>
                    <span className="font-semibold text-gray-900">
                      Rs {booking.total_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Refund Information */}
              <div className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">
                      Refund Amount
                    </h4>
                    <p className="text-2xl font-bold text-yellow-900 mb-2">
                      Rs {refundInfo.refund_amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-yellow-800">
                      {refundInfo.refund_percentage}% of total amount
                    </p>
                  </div>
                </div>
              </div>

              {/* Policy Details */}
              <div className="bg-blue-50 rounded-lg p-4 text-sm">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Cancellation Policy Applied
                </h4>
                <p className="text-blue-800">{refundInfo.policy_applied}</p>
                <p className="text-blue-700 text-xs mt-2">
                  Refunds are processed within 5-7 business days
                </p>
              </div>

              {/* Cancellation Policy Terms */}
              <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Platform Cancellation Terms
                </h4>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>7+ days before check-in: 100% refund</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">⊘</span>
                    <span>3-6 days before check-in: 50% refund</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Less than 3 days: No refund</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => setShowCancellationModal(false)}
                disabled={cancelling}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmCancellation}
                disabled={cancelling}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X size={18} />
                    Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
