import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import PublicNavbar from '../../components/Navbar/PublicNavbar';
import Footer from '../../components/Footer';
import API from '../../services/api';

const PaymentFailed: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [reason, setReason] = useState('Payment was cancelled or declined');
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    loadBookingData();
  }, [bookingId]);

  const loadBookingData = async () => {
    try {
      const response = await API.get(`bookings/${bookingId}/`);
      setBookingData(response.data);
      
      // Check for failure reason in URL params
      const searchParams = new URLSearchParams(window.location.search);
      const failureReason = searchParams.get('reason');
      if (failureReason) {
        setReason(decodeURIComponent(failureReason));
      }
    } catch (error) {
      console.error('Failed to load booking:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-grow max-w-3xl mx-auto w-full px-6 py-12">
        <div className="space-y-6">
          {/* Main Error Card */}
          <div className="bg-white rounded-3xl p-8 border border-red-200 shadow-lg">
            <div className="flex items-start gap-6 mb-8">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <div className="flex-grow">
                <h2 className="text-3xl font-bold text-gray-900">Payment Failed</h2>
                <p className="text-gray-600 mt-2 text-lg">{reason}</p>
              </div>
            </div>

            {/* What Went Wrong */}
            <div className="bg-red-50 rounded-2xl p-6 mb-8 border border-red-100">
              <h3 className="font-bold text-gray-900 mb-4">What Went Wrong?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-0.5">•</span>
                  <span className="text-gray-700">Your payment could not be processed by eSewa</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-0.5">•</span>
                  <span className="text-gray-700">Please check your account balance and try again</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 font-bold mt-0.5">•</span>
                  <span className="text-gray-700">If the problem persists, please contact support</span>
                </li>
              </ul>
            </div>

            {/* Booking Info (if available) */}
            {bookingData && (
              <div className="border-t border-gray-200 pt-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-4">Booking Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                    <p className="font-bold text-gray-900 text-lg">#{bookingData.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="font-bold text-gray-900 text-lg">Rs. {bookingData.total_price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Check-in</p>
                    <p className="font-bold text-gray-900">
                      {bookingData.check_in ? new Date(bookingData.check_in).toLocaleDateString() : '---'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Check-out</p>
                    <p className="font-bold text-gray-900">
                      {bookingData.check_out ? new Date(bookingData.check_out).toLocaleDateString() : '---'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Troubleshooting Tips */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-4">Troubleshooting Tips</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                  <div>
                    <p className="font-bold text-gray-900">Check Your Balance</p>
                    <p className="text-gray-600 text-sm">Make sure you have sufficient funds in your eSewa account</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">2</span>
                  <div>
                    <p className="font-bold text-gray-900">Verify Your Details</p>
                    <p className="text-gray-600 text-sm">Ensure all your payment information is correct</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">3</span>
                  <div>
                    <p className="font-bold text-gray-900">Try a Different Payment Method</p>
                    <p className="text-gray-600 text-sm">Contact eSewa support or try after some time</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate(`/payment/${bookingId}`)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#A989C8] text-white rounded-xl font-bold hover:bg-[#9677b4] transition-colors shadow-md"
            >
              Try Payment Again
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/properties')}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Browse Properties
            </button>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-[#A989C8]/10 to-purple-50 rounded-3xl p-8 border border-[#A989C8]/20 text-center">
            <p className="text-gray-700 mb-4">Need help? Our support team is here for you</p>
            <a
              href="mailto:support@stayeasy.com"
              className="inline-block px-6 py-2 text-[#A989C8] font-bold hover:text-[#9677b4] transition-colors"
            >
              Contact Support →
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentFailed;
