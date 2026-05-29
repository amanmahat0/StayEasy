import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RotateCcw, DollarSign, TrendingDown, ArrowUpRight } from 'lucide-react';
import PublicNavbar from "../../components/Navbar/PublicNavbar";
import Footer from "../../components/Footer";
import API from '../../services/api';

interface RefundRecord {
  id: number;
  booking_id: number;
  tenant_name: string;
  tenant_email: string;
  property_name: string;
  property_city: string;
  paid_amount: string;
  refund_amount: string;
  refund_percentage: number;
  remaining_amount: string;
  status: string;
  payment_status: string;
  policy_applied: string;
  reason: string;
  requested_at: string;
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'processed':
      return 'bg-green-50 text-green-500 border-green-100';
    case 'pending':
      return 'bg-yellow-50 text-yellow-500 border-yellow-100';
    case 'failed':
      return 'bg-red-50 text-red-500 border-red-100';
    default:
      return 'bg-gray-50 text-gray-500 border-gray-100';
  }
};

const RefundHistory = () => {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('landlord/refunds/');
      const data = response.data.results || response.data || [];
      setRefunds(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.response?.status === 401) setError('Unauthorized: Please login again.');
      else if (err.response?.data?.error) setError(err.response.data.error);
      else setError('Failed to fetch refund records.');
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = refunds.reduce((s, r) => s + parseFloat(r.paid_amount || '0'), 0);
  const totalRefunded = refunds.reduce((s, r) => s + parseFloat(r.refund_amount || '0'), 0);
  const totalRemaining = refunds.reduce((s, r) => s + parseFloat(r.remaining_amount || '0'), 0);
  const pendingRefunds = refunds.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col font-sans">
      <PublicNavbar />

      <div className="bg-gradient-to-b from-[#A87DC2]/10 to-transparent pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-4xl font-extrabold text-[#1A1A1A] mb-2">Refunds</h1>
              <p className="text-gray-500 text-lg">All refunds from cancelled bookings</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 -mt-12 mb-20">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="animate-spin text-[#A87DC2] mb-4" size={40} />
            <p className="text-gray-400 font-medium">Loading refunds...</p>
          </div>
        ) : refunds.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
            <RotateCcw size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No refunds yet</p>
            <p className="text-gray-300 text-sm mt-1">Refunds are created when tenants cancel bookings</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-3">
                  <DollarSign className="text-purple-500" size={22} />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                <h2 className="text-xl font-bold text-gray-900">NPR {totalPaid.toLocaleString()}</h2>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
                  <TrendingDown className="text-red-500" size={22} />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Refunded</p>
                <h2 className="text-xl font-bold text-gray-900">NPR {totalRefunded.toLocaleString()}</h2>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-3">
                  <ArrowUpRight className="text-green-500" size={22} />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Kept (Net)</p>
                <h2 className="text-xl font-bold text-gray-900">NPR {totalRemaining.toLocaleString()}</h2>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center mb-3">
                  <RotateCcw className="text-yellow-500" size={22} />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Pending</p>
                <h2 className="text-xl font-bold text-gray-900">{pendingRefunds}</h2>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-50 text-[11px] uppercase tracking-[0.15em] text-gray-400 font-black">
                      <th className="px-6 py-5">Tenant</th>
                      <th className="px-6 py-5">Property</th>
                      <th className="px-6 py-5">Paid</th>
                      <th className="px-6 py-5">Refund</th>
                      <th className="px-6 py-5">Remaining</th>
                      <th className="px-6 py-5">Policy</th>
                      <th className="px-6 py-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {refunds.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-800 text-sm">{r.tenant_name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{r.tenant_email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800 text-sm">{r.property_name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{r.property_city}</p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm">
                          NPR {parseFloat(r.paid_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-sm"
                            style={{ color: parseFloat(r.refund_amount) > 0 ? '#DC2626' : '#9CA3AF' }}>
                            -NPR {parseFloat(r.refund_amount).toLocaleString()}
                          </span>
                          {parseFloat(r.refund_amount) > 0 && (
                            <p className="text-[10px] text-gray-400 font-bold">{r.refund_percentage}%</p>
                          )}
                        </td>
                        <td className="px-6 py-4 font-semibold text-green-600 text-sm">
                          NPR {parseFloat(r.remaining_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-gray-600 max-w-[200px] truncate" title={r.policy_applied}>
                            {r.policy_applied}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border ${statusBadge(r.status)}`}>
                            {r.status === 'processed' ? 'Processed' : r.status === 'pending' ? 'Pending' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RefundHistory;
