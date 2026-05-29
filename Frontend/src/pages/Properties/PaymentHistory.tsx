import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import PublicNavbar from "../../components/Navbar/PublicNavbar";
import Footer from "../../components/Footer";
import API from '../../services/api';

interface PaymentRecord {
  id: number;
  user_info: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  property_info: {
    id: number;
    title: string;
    price: number;
  };
  total_price: number;
  payment_status: string;
  created_at: string;
}

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('landlord/payments/');
      const data: PaymentRecord[] = response.data.results || response.data || [];
      setPayments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Unauthorized: Please login again.');
      } else if (err.response?.status === 403) {
        setError('Forbidden: You do not have permission.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to fetch payment history.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col font-sans">
      <PublicNavbar />

      <div className="bg-gradient-to-b from-[#A87DC2]/10 to-transparent pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-4xl font-extrabold text-[#1A1A1A] mb-2">
                Payment History
              </h1>
              <p className="text-gray-500 text-lg">All completed payments across your properties</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 -mt-12 mb-20">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="animate-spin text-[#A87DC2] mb-4" size={40} />
            <p className="text-gray-400 font-medium">Loading payment history...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
            <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No payments found</p>
            <p className="text-gray-300 text-sm mt-1">Completed payments will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-50 text-[11px] uppercase tracking-[0.15em] text-gray-400 font-black">
                    <th className="px-8 py-6">Tenant</th>
                    <th className="px-6 py-6">Property</th>
                    <th className="px-6 py-6">Amount</th>
                    <th className="px-6 py-6">Date</th>
                    <th className="px-6 py-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((payment) => {
                    const first = payment.user_info?.first_name || '';
                    const last = payment.user_info?.last_name || '';
                    const name = `${first} ${last}`.trim() || payment.user_info?.email || 'Unknown';
                    return (
                      <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-bold text-gray-800 text-sm">{name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{payment.user_info?.email}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-semibold text-gray-800 text-sm">{payment.property_info?.title || 'Unknown'}</p>
                        </td>
                        <td className="px-6 py-5 font-black text-gray-900 text-sm">
                          NPR {parseFloat(payment.total_price?.toString() || '0').toLocaleString()}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                            payment.payment_status === 'completed'
                              ? 'bg-green-50 text-green-500 border border-green-100'
                              : 'bg-red-50 text-red-500 border border-red-100'
                          }`}>
                            {payment.payment_status === 'completed'
                              ? <CheckCircle2 size={12} />
                              : <XCircle size={12} />
                            }
                            {payment.payment_status === 'completed' ? 'Paid' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PaymentHistory;
