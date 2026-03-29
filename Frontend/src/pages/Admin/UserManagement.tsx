import React, { useState, useEffect } from 'react';
import { 
  Users, Eye, Mail, Phone, Calendar, MapPin, 
  CreditCard, FileText, ChevronLeft, Shield, 
  CheckCircle2, Search, Filter, Loader2
} from 'lucide-react';
import { Header } from '../../components/admin/Header';
import { adminGetAllKYC } from '../../services/api'; // Importing your real API service

const UserManagement: React.FC = () => {
  const [kycList, setKycList] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminGetAllKYC();
        setKycList(data);
      } catch (error) {
        console.error("Error fetching KYC data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="animate-spin text-[#A989C8]" size={40} />
      </div>
    );
  }

  // --- VIEW 1: MAIN USER MANAGEMENT DASHBOARD ---
  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pb-12 font-sans">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-[#A989C8]" size={28} strokeWidth={2.5} />
              <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">User Management</h1>
            </div>
            <p className="text-gray-500 font-medium text-sm">Manage all users, verify accounts, and monitor activity</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <StatCard icon={<Users size={20}/>} label="Total Records" value={kycList.length} color="purple" />
            <StatCard icon={<Shield size={20}/>} label="Verified" value={kycList.filter(k => k.status === 'approved').length} color="green" />
            <StatCard icon={<Users size={20}/>} label="Pending" value={kycList.filter(k => k.status === 'pending').length} color="blue" />
            <StatCard icon={<CheckCircle2 size={20}/>} label="Rejected" value={kycList.filter(k => k.status === 'rejected').length} color="indigo" />
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-[2rem] p-4 border border-gray-100 shadow-sm mb-8 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input type="text" placeholder="Search by name or citizenship..." className="w-full pl-12 pr-4 py-3 bg-transparent text-sm font-medium focus:outline-none" />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-xl text-gray-500 font-bold text-sm">
              <Filter size={18} /> Filter
            </button>
          </div>

          {/* User List Table */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-4">
             <p className="px-6 py-4 font-black text-gray-900">{kycList.length} Users Found</p>
             <div className="divide-y divide-gray-50">
                {kycList.map((kyc) => (
                  <UserRow 
                    key={kyc.id}
                    kyc={kyc}
                    onView={() => setSelectedUser(kyc)} 
                  />
                ))}
             </div>
          </div>
        </main>
      </div>
    );
  }

  // --- VIEW 2: THE REAL DATA DETAIL VIEW ---
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        <div className="mb-10">
          <button 
            onClick={() => setSelectedUser(null)} 
            className="flex items-center gap-2 text-gray-400 hover:text-gray-800 transition-colors mb-4 font-bold text-xs uppercase tracking-widest"
          >
            <ChevronLeft size={16} strokeWidth={3} /> Back to Dashboard
          </button>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <Shield className="text-[#A989C8]" size={28} />
                <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tighter uppercase">USER DETAIL</h1>
              </div>
              <p className="text-gray-400 text-sm font-medium mt-1">Reviewing verification for {selectedUser.full_name}</p>
            </div>
            <div className={`px-5 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-widest border ${
              selectedUser.status === 'approved' 
              ? 'bg-[#E8F5E9] text-[#4CAF50] border-[#C8E6C9]' 
              : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              {selectedUser.status}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8 space-y-8">
            
            {/* Personal Information */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Personal Information</h3>
              <div className="flex gap-10">
                <img 
                  src={selectedUser.document_image || "https://i.pravatar.cc/150"} 
                  className="w-24 h-24 rounded-2xl object-cover ring-8 ring-gray-50" 
                  alt="Avatar" 
                />
                <div className="flex-1 grid grid-cols-2 gap-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-xl font-black text-gray-900">{selectedUser.full_name}</h4>
                      <span className="bg-[#F3E5F5] text-[#A989C8] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                        {selectedUser.user_info.user_type}
                      </span>
                    </div>
                    <DetailItem icon={<Mail size={14}/>} text={selectedUser.user_info.email} />
                    <DetailItem icon={<MapPin size={14}/>} text="Location details in records" />
                  </div>
                  <div className="pt-10 space-y-3">
                    <DetailItem icon={<Phone size={14}/>} text={selectedUser.phone_number} />
                    <DetailItem icon={<CreditCard size={14}/>} text={`Citizenship: ${selectedUser.citizenship_number}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Documents - Using Real Image Links */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Submitted Documents</h3>
              
              <div className="space-y-8">
                <div className="border border-gray-50 rounded-3xl p-8 bg-[#FCFCFD]">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="text-[#A989C8]" size={20} />
                    <div>
                      <h4 className="font-black text-gray-800 text-sm">Citizenship Certificate</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-tighter">
                        Doc Num: {selectedUser.citizenship_number}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <ImagePreview label="Front Side" src={selectedUser.document_image} />
                    <ImagePreview label="Back Side" src={null} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-4">
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 sticky top-10">
              <h3 className="text-lg font-black text-gray-900 mb-8 tracking-tight">Submission Details</h3>
              <div className="space-y-6">
                <SidebarRow label="Submission ID" value={`ver-00${selectedUser.id}`} />
                <SidebarRow label="Submitted On" value={new Date(selectedUser.submitted_at).toLocaleDateString()} />
                <hr className="border-gray-50" />
                <SidebarRow label="Reviewed By" value={selectedUser.verified_by_info?.username || "Pending"} />
                
                <div className="mt-8 p-6 bg-[#F1F8E9] rounded-2xl border border-[#DCEDC8]">
                  <p className="text-[10px] font-black text-[#689F38] uppercase tracking-widest mb-1.5">Record Note</p>
                  <p className="text-xs font-bold text-[#33691E] leading-relaxed">
                    Identity verified via citizenship record check.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* --- SHARED COMPONENTS --- */

const UserRow = ({ kyc, onView }: any) => (
  <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-all cursor-pointer">
    <div className="flex items-center gap-4">
      <img src={kyc.document_image || "https://i.pravatar.cc/100"} className="w-12 h-12 rounded-xl object-cover" alt="" />
      <div>
        <div className="flex items-center gap-2">
          <p className="font-black text-gray-900">{kyc.full_name}</p>
          <span className="bg-[#F3E5F5] text-[#A989C8] text-[8px] font-black px-1.5 py-0.5 rounded uppercase">{kyc.user_info.user_type}</span>
          {kyc.status === 'approved' && <span className="bg-[#E8F5E9] text-[#4CAF50] text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Verified</span>}
        </div>
        <div className="flex gap-4 mt-1">
          <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Mail size={12}/> {kyc.user_info.email}</span>
          <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Phone size={12}/> {kyc.phone_number}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-8">
      <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
        <Calendar size={12}/> {new Date(kyc.submitted_at).toLocaleDateString()}
      </span>
      <button onClick={onView} className="px-5 py-2.5 bg-[#A989C8] text-white rounded-xl text-xs font-black shadow-lg shadow-purple-100 flex items-center gap-2">
        <Eye size={16} /> View Details
      </button>
    </div>
  </div>
);

const ImagePreview = ({ label, src }: any) => (
  <div className="space-y-2">
    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-1">{label}</p>
    {src ? (
      <img src={src} className="aspect-[1.8/1] w-full rounded-2xl object-cover border-2 border-gray-50 shadow-sm" alt={label} />
    ) : (
      <div className="aspect-[1.8/1] bg-white rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-200 uppercase tracking-widest">No Image Found</div>
    )}
  </div>
);

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-50 flex items-center gap-4">
    <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-500`}>{icon}</div>
    <div>
      <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

const DetailItem = ({ icon, text }: any) => (
  <div className="flex items-center gap-2.5 text-gray-400 font-bold text-xs mb-2 last:mb-0">
    <span className="text-gray-300">{icon}</span> {text}
  </div>
);

const SidebarRow = ({ label, value }: any) => (
  <div>
    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-gray-800 tracking-tight">{value}</p>
  </div>
);

export default UserManagement;