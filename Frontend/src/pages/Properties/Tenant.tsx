import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, Mail, Phone, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import PublicNavbar from "../../components/Navbar/PublicNavbar";
import Footer from "../../components/Footer";
import API from '../../services/api';

interface BookingData {
  id: number;
  user_info: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username?: string;
    phone?: string;
    kyc_status?: string;
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
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending' | 'processing';
  created_at: string;
}

interface TenantInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  status: string;
  kycVerified: boolean;
  monthlyRent: string;
  depositPaid: string;
  moveInDate: string;
  leaseEndDate: string;
  initials: string;
}

const Tenant: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All Tenants');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const response = await API.get('landlord/bookings/');
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      // Handle both paginated and non-paginated responses
      const bookings: BookingData[] = response.data.results || response.data || [];
      console.log('Parsed bookings:', bookings);
      
      if (!Array.isArray(bookings)) {
        console.error('Bookings is not an array:', bookings);
        setError('Invalid data format received from server');
        setTenants([]);
        return;
      }
      
      const tenantsInfo = bookings.map((booking) => {
        const firstName = booking.user_info?.first_name || '';
        const lastName = booking.user_info?.last_name || '';
        const kycStatus = booking.user_info?.kyc_status || 'not_submitted';
        
        return {
          id: (booking.user_info?.id || booking.id).toString(),
          name: `${firstName} ${lastName}`.trim() || booking.user_info?.email || 'Unknown',
          email: booking.user_info?.email || '',
          phone: booking.user_info?.phone || 'Not provided',
          property: booking.property_info?.title || 'Unknown Property',
          status: booking.status === 'confirmed' ? 'Booked' : booking.status === 'processing' ? 'Processing' : 'Cancelled',
          kycVerified: kycStatus === 'approved',
          monthlyRent: `NPR ${booking.property_info?.price?.toLocaleString() || '0'}`,
          depositPaid: `NPR ${((booking.property_info?.price || 0)).toLocaleString()}`,
          moveInDate: new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          leaseEndDate: new Date(booking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          initials: (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'TN',
        };
      });
      
      console.log('Transformed tenants:', tenantsInfo);
      setTenants(tenantsInfo);
    } catch (err: any) {
      let errorMessage = 'Failed to fetch tenants';
      
      if (err.response?.status === 401) {
        errorMessage = 'Unauthorized: Please login again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden: You do not have permission to view tenants.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Error fetching tenants:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { name: 'All Tenants', count: tenants.length },
    { name: 'Active', count: tenants.filter(t => t.status === 'Active' || t.status === 'Booked').length },
    { name: 'Moved Out', count: 0 },
  ];

  const filteredTenants = tenants.filter((tenant) => {
    const matchesTab = activeTab === 'All Tenants' || tenant.status === activeTab;
    const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-[#1A1A1A] mb-3">Tenant</h1>
          <p className="text-gray-500 text-lg">View and manage all your tenants in one place</p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-[2rem] shadow-sm p-6 mb-10 border border-gray-100">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tenants by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A87DC2]/20 focus:border-[#A87DC2] transition-all"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  activeTab === tab.name
                    ? 'bg-[#A87DC2] text-white shadow-md shadow-purple-100'
                    : 'bg-[#F1F3F7] text-gray-500 hover:bg-gray-200'
                }`}
              >  
                {tab.name} <span className="ml-1 opacity-70">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="animate-spin text-[#A87DC2] mb-4" size={40} />
            <p className="text-gray-400 font-medium">Loading tenants...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTenants.map((tenant) => (
              <div key={tenant.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-5">
                    {/* Initials Avatar */}
                    <div className="w-14 h-14 rounded-full bg-[#A87DC2] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {tenant.initials}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-2xl font-bold text-gray-800">{tenant.name}</h3>
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          tenant.status === 'Active' ? 'bg-green-50 text-green-500 border border-green-100' : 'bg-orange-50 text-orange-500 border border-orange-100'
                        }`}>
                          {tenant.status === 'Active' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {tenant.status}
                        </span>
                        {tenant.kycVerified && (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-500 border border-green-100 text-[10px] font-black uppercase tracking-wider">
                            <CheckCircle2 size={12} /> KYC Verified
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Mail size={14} className="opacity-70" /> {tenant.email}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={14} className="opacity-70" /> {tenant.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-gray-600">
                    <MoreVertical size={24} />
                  </button>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-[#F9FAFB] p-5 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly Rent</p>
                    <p className="font-bold text-[#A87DC2] text-lg">{tenant.monthlyRent}</p>
                  </div>
                  <div className="bg-[#F9FAFB] p-5 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Deposit Paid</p>
                    <p className="font-bold text-gray-800 text-lg">{tenant.depositPaid}</p>
                  </div>
                  <div className="bg-[#F9FAFB] p-5 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Move-in Date</p>
                    <p className="font-bold text-gray-800 text-lg">{tenant.moveInDate}</p>
                  </div>
                  <div className="bg-[#F9FAFB] p-5 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lease End Date</p>
                    <p className="font-bold text-gray-800 text-lg">{tenant.leaseEndDate}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="px-6 py-2.5 bg-[#A87DC2] text-white rounded-xl text-sm font-bold shadow-sm shadow-purple-100 hover:bg-[#9676B5] transition-colors">
                    View Details
                  </button>
                  <button className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                    Contact
                  </button>
                  <button 
                    onClick={() => navigate(`/payment-history/${tenant.id}`)}
                    className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                  >
                    Payment History
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Tenant;