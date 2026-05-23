import { useState } from "react";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../../services/api";

export default function Payment({ 
  onBack,
  bookingData 
}: { 
  onBack: () => void;
  bookingData?: {
    propertyId?: number;
    total_price?: number;
    moveInDate?: string;
    leaseDuration?: string;
  };
}) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');

  // Use booking data if provided, otherwise use defaults
  const totalAmount = bookingData?.total_price || 0;
  const monthlyPrice = Math.round(totalAmount / (parseInt(bookingData?.leaseDuration || "12")));
  const securityDeposit = Math.round(monthlyPrice * 2);
  const serviceFee = Math.round(totalAmount * 0.05);
  const payingNow = paymentType === 'full' ? totalAmount : Math.round(monthlyPrice + securityDeposit);
  const remaining = Math.max(0, totalAmount - payingNow);

  const handleEsewaPayment = async () => {
    try {
      setError(null);
      setIsProcessing(true);

      console.log("📍 Booking Data received:", bookingData);

      // Validate booking data
      if (!bookingData?.propertyId) {
        setError("Missing property ID - this shouldn't happen");
        setIsProcessing(false);
        return;
      }

      if (!bookingData?.moveInDate) {
        setError("Missing move-in date");
        setIsProcessing(false);
        return;
      }

      // Calculate check-out date
      const checkInDate = new Date(bookingData.moveInDate);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setMonth(checkOutDate.getMonth() + (parseInt(bookingData.leaseDuration || "12")));
      const checkOutStr = checkOutDate.toISOString().split('T')[0];

      console.log("📍 Booking to create:", {
        property: bookingData.propertyId,
        check_in: bookingData.moveInDate,
        check_out: checkOutStr,
        total_price: totalAmount,
        payment_type: paymentType,
      });

      // Create booking first, then initiate eSewa payment
      const bookingResponse = await API.post("bookings/create/", {
        property: bookingData.propertyId,
        check_in: bookingData.moveInDate,
        check_out: checkOutStr,
        total_price: totalAmount,
        payment_type: paymentType,
      });

      console.log("📍 Booking created:", bookingResponse.data);

      if (bookingResponse.data.id) {
        // Navigate to eSewa payment page with booking ID
        console.log("📍 Navigating to payment page with booking ID:", bookingResponse.data.id);
        navigate(`/payment/${bookingResponse.data.id}`);
      }
    } catch (err: any) {
      console.error("❌ Booking creation error:", err);
      console.error("❌ Error response data:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      
      let errorMsg = "Failed to create booking. Please try again.";
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMsg = err.response.data.error;
        } else if (typeof err.response.data === 'object') {
          // Get first error field
          const firstError = Object.entries(err.response.data)[0];
          if (firstError) {
            const [key, value] = firstError;
            if (Array.isArray(value)) {
              errorMsg = `${key}: ${value[0]}`;
            } else {
              errorMsg = `${key}: ${value}`;
            }
          }
        }
      }
      
      setError(errorMsg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button positioned above the payment details */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-bold text-sm mb-6 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        BACK
      </button>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Payment Form */}
        <div className="col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
            
            {/* Full Payment Option */}
            <div 
              onClick={() => setPaymentType('full')}
              className={`p-5 mb-4 border-2 rounded-2xl cursor-pointer transition-all ${
                paymentType === 'full' 
                  ? 'border-[#A989C8] bg-purple-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentType === 'full' ? 'border-[#A989C8] bg-[#A989C8]' : 'border-gray-300'
                }`}>
                  {paymentType === 'full' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900">Pay Full Amount</p>
                  <p className="text-sm text-gray-600">Pay NPR {payingNow.toLocaleString()} now</p>
                </div>
              </div>
            </div>

            {/* Partial Payment Option */}
            <div 
              onClick={() => setPaymentType('partial')}
              className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                paymentType === 'partial' 
                  ? 'border-[#A989C8] bg-purple-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentType === 'partial' ? 'border-[#A989C8] bg-[#A989C8]' : 'border-gray-300'
                }`}>
                  {paymentType === 'partial' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div>
                  <p className="font-bold text-gray-900">Partial Payment</p>
                  <p className="text-sm text-gray-600">Pay NPR {payingNow.toLocaleString()} now (deposit + first month)</p>
                </div>
              </div>
            </div>

            {/* eSewa Payment Gateway Info */}
            <div className="mt-8 p-5 bg-gradient-to-r from-purple-50 to-purple-50 border border-[#A989C8] rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#A989C8] rounded-lg flex items-center justify-center text-white font-bold text-sm">e</div>
                <div>
                  <p className="font-bold text-gray-900">eSewa Payment</p>
                  <p className="text-xs text-gray-600">Secure payment gateway</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-3">
                <Lock size={14} className="text-[#A989C8]" />
                Your payment information is encrypted and secure
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm font-bold text-red-700">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <button 
                onClick={onBack}
                disabled={isProcessing}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:border-gray-300 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button 
                onClick={handleEsewaPayment}
                disabled={isProcessing}
                className="flex-1 py-4 bg-[#A989C8] hover:bg-[#9677b4] disabled:bg-gray-400 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay Now - NPR {payingNow.toLocaleString()}</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Summary */}
        <div className="col-span-5">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Summary</h3>
            
            {/* Breakdown */}
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Rent ({bookingData?.leaseDuration} months)</p>
                <p className="font-semibold text-gray-900">NPR {totalAmount.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Security Deposit</p>
                <p className="font-semibold text-gray-900">NPR {securityDeposit.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Service Fee (5%)</p>
                <p className="font-semibold text-gray-900">NPR {serviceFee.toLocaleString()}</p>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-900 font-bold text-lg">Total</p>
              <p className="text-2xl font-bold text-gray-900">NPR {(totalAmount + serviceFee).toLocaleString()}</p>
            </div>

            {/* Payment Amount Due */}
            <div className="bg-purple-50 border border-[#A989C8] rounded-2xl p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Paying now</p>
              <p className="text-2xl font-bold text-[#A989C8]">NPR {payingNow.toLocaleString()}</p>
            </div>

            {/* Remaining Amount */}
            {remaining > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Remaining</p>
                <p className="text-lg font-bold text-[#A989C8]">NPR {remaining.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 