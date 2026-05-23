import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Download, DollarSign, Calendar, Clock, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import PublicNavbar from "../../components/Navbar/PublicNavbar";
import Footer from "../../components/Footer";
import API from '../../services/api';

interface PaymentData {
  id: number;
  user_info: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username?: string;
  };
  property_info: {
    id: number;
    title: string;
    price: number;
    address?: string;
    city?: string;
  };
  check_in: string;
  check_out: string;
  total_price: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  payment_method: 'esewa' | 'bank_transfer' | 'cash';
  payment_status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

const Payment: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tenantName, setTenantName] = useState('');

  useEffect(() => {
    fetchTenantPayments();
  }, [tenantId]);

  const fetchTenantPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get(`landlord/payments/${tenantId}/`);
      console.log('Payment History Response:', response);
      
      const paymentsList: PaymentData[] = response.data.results || response.data || [];
      
      if (!Array.isArray(paymentsList)) {
        console.error('Payments is not an array:', paymentsList);
        setError('Invalid data format received from server');
        setPayments([]);
        return;
      }
      
      setPayments(paymentsList);
      
      // Set tenant name from first payment
      if (paymentsList.length > 0) {
        const firstName = paymentsList[0].user_info?.first_name || '';
        const lastName = paymentsList[0].user_info?.last_name || '';
        setTenantName(`${firstName} ${lastName}`.trim());
      }
    } catch (err: any) {
      let errorMessage = 'Failed to fetch payment history';
      
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized: Please login again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden: You do not have permission to view this tenant\'s payments.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error fetching payments:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.total_price?.toString() || '0'), 0);
  const completedPayments = payments.filter(p => p.payment_status === 'completed').length;
  const pendingPayments = payments.filter(p => p.payment_status === 'pending').length;
  const failedPayments = payments.filter(p => p.payment_status === 'failed').length;

  const stats = [
    { label: 'Total Revenue', value: `NPR ${totalRevenue.toLocaleString()}`, icon: <DollarSign className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Completed', value: completedPayments.toString(), icon: <CheckCircle2 className="text-green-500" />, bg: 'bg-green-50' },
    { label: 'Pending', value: pendingPayments.toString(), icon: <Clock className="text-orange-500" />, bg: 'bg-orange-50' },
    { label: 'Failed', value: failedPayments.toString(), icon: <AlertCircle className="text-red-500" />, bg: 'bg-red-50' },
  ];

  const filteredPayments = payments.filter((payment) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      payment.property_info?.title?.toLowerCase().includes(searchTerm) ||
      payment.user_info?.email?.toLowerCase().includes(searchTerm) ||
      payment.id.toString().includes(searchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col font-sans">
      <PublicNavbar />

      {/* Header Section with Purple Gradient Background */}
      <div className="bg-gradient-to-b from-[#A87DC2]/10 to-transparent pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/tenant')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-4xl font-extrabold text-[#1A1A1A] mb-2">
                Payment History - {tenantName}
              </h1>
              <p className="text-gray-500 text-lg">Track rental payments for this tenant</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 -mt-12 mb-20">
        {/* Error Message */}
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
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-start">
                  <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
                    {stat.icon}
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h2 className="text-2xl font-bold text-gray-900">{stat.value}</h2>
                </div>
              ))}
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-[2rem] shadow-sm p-6 mb-8 border border-gray-100 flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by property, email, or transaction ID..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A87DC2]/20 focus:border-[#A87DC2]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="bg-[#A87DC2] hover:bg-[#9668AF] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#A87DC2]/20">
                <Download size={18} /> Export
              </button>
            </div>

            {/* Transactions Table */}
            {filteredPayments.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-8 text-center border border-gray-100">
                <p className="text-gray-400 text-lg">No payment records found for this tenant.</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-50 text-[11px] uppercase tracking-[0.15em] text-gray-400 font-black">
                        <th className="px-8 py-6">Property</th>
                        <th className="px-6 py-6">Amount</th>
                        <th className="px-6 py-6">Method</th>
                        <th className="px-6 py-6">Check-in</th>
                        <th className="px-6 py-6">Check-out</th>
                        <th className="px-6 py-6">Status</th>
                        <th className="px-6 py-6">Payment Status</th>
                        <th className="px-6 py-6">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredPayments.map((payment, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div>
                              <p className="font-bold text-gray-800 text-sm">{payment.property_info?.title || 'Unknown'}</p>
                              <p className="text-[10px] text-gray-400 font-bold">{payment.property_info?.city || ''}</p>
                            </div>
                          </td>
                          <td className="px-6 py-6 font-black text-gray-900 text-sm">NPR {parseFloat(payment.total_price?.toString() || '0').toLocaleString()}</td>
                          <td className="px-6 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                              payment.payment_method === 'esewa' ? 'bg-purple-50 text-purple-400' : 
                              payment.payment_method === 'bank_transfer' ? 'bg-blue-50 text-blue-400' : 
                              'bg-gray-50 text-gray-400'
                            }`}>
                              {payment.payment_method === 'esewa' ? 'eSewa' : payment.payment_method === 'bank_transfer' ? 'Bank Transfer' : 'Cash'}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-sm text-gray-600">
                            {new Date(payment.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-6 text-sm text-gray-600">
                            {new Date(payment.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-6">
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                              payment.status === 'completed' ? 'bg-green-50 text-green-500 border border-green-100' : 
                              payment.status === 'confirmed' ? 'bg-blue-50 text-blue-500 border border-blue-100' : 
                              'bg-red-50 text-red-500 border border-red-100'
                            }`}>
                              {payment.status === 'completed' ? <CheckCircle2 size={12} /> : 
                               payment.status === 'confirmed' ? <Calendar size={12} /> : 
                               <AlertCircle size={12} />}
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                              payment.payment_status === 'completed' ? 'bg-green-50 text-green-500 border border-green-100' : 
                              payment.payment_status === 'pending' ? 'bg-orange-50 text-orange-500 border border-orange-100' : 
                              'bg-red-50 text-red-500 border border-red-100'
                            }`}>
                              {payment.payment_status === 'completed' ? <CheckCircle2 size={12} /> : 
                               payment.payment_status === 'pending' ? <Clock size={12} /> : 
                               <AlertCircle size={12} />}
                              {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-[10px] font-bold text-gray-400 tracking-wider font-mono">{payment.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Payment;