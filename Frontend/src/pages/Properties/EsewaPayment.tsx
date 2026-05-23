import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import PublicNavbar from '../../components/Navbar/PublicNavbar';
import Footer from '../../components/Footer';
import API from '../../services/api';

const EsewaPayment: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initiatePayment();
  }, [bookingId]);

  const initiatePayment = async () => {
    try {
      // Get payment initiation data from backend
      const paymentResponse = await API.post('payment/esewa/initiate/', {
        booking_id: bookingId,
      });

      if (paymentResponse.data && paymentResponse.data.payment_data) {
        const paymentData = paymentResponse.data.payment_data;
        
        // Create and submit form to eSewa
        submitEsewaForm(paymentData);
      } else {
        throw new Error('Invalid payment data received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.response?.data?.detail || 'Failed to initiate payment. Please try again.');
    }
  };

  const submitEsewaForm = (paymentData: any) => {
    try {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

      const formFields: { [key: string]: string } = {
        amt: String(paymentData.amt || 0),
        psc: String(paymentData.psc || 0),
        pdc: String(paymentData.pdc || 0),
        txAmt: String(paymentData.txAmt || 0),
        tAmt: String(paymentData.tAmt || 0),
        pid: String(paymentData.pid || bookingId),
        scd: String(paymentData.scd || 'EPAYTEST'),
        su: String(paymentData.su || `${window.location.origin}/payment-success/${bookingId}`),
        fu: String(paymentData.fu || `${window.location.origin}/payment-failed/${bookingId}`),
      };

      // Add signature if provided
      if (paymentData.signature) {
        formFields.signature = paymentData.signature;
      }

      Object.entries(formFields).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError('Failed to submit payment form. Please try again.');
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PublicNavbar />
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <AlertCircle className="text-red-500 flex-shrink-0" size={28} />
              <h2 className="text-xl font-bold text-gray-900">Payment Error</h2>
            </div>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-2 bg-[#A989C8] text-white font-bold rounded-lg hover:bg-[#9677b4] transition"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center">
              <Loader2 className="text-[#A989C8] animate-spin" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600 mb-2">Redirecting to eSewa payment gateway...</p>
          <p className="text-sm text-gray-500">Please wait, do not close this window.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EsewaPayment;
