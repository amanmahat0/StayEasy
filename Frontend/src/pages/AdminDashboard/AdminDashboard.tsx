import React from 'react';
import { 
  Shield, Clock, Users, Home, Calendar, DollarSign, 
  CheckCircle, Activity, X 
} from 'lucide-react';
import { StatCard, MetricCard } from '../../components/admin/Cards';
import { KycListItem } from '../../components/admin/KycListItem';
import { Header } from '../../components/admin/Header';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="text-purple-600" size={24} /> Admin Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Overview of platform performance and pending verifications</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Last updated</p>
            <p className="text-sm font-medium text-gray-700">Mar 21, 2026, 09:14 PM</p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard 
            title="Pending Reviews" value="2" subtext="" linkText="Review now &rarr;"
            icon={<Clock size={20} />} trendValue="+12%" trendColorClass="text-amber-600"
            bgClass="bg-amber-50" borderClass="border-amber-100" iconBgClass="bg-amber-100" iconColorClass="text-amber-600"
          />
          <StatCard 
            title="Total Users" value="3" subtext="1 verified"
            icon={<Users size={20} />} trendValue="+23%" trendColorClass="text-green-500"
            bgClass="bg-purple-50" borderClass="border-purple-100" iconBgClass="bg-purple-100" iconColorClass="text-purple-600"
          />
          <StatCard 
            title="Total Properties" value="0" subtext="0 available"
            icon={<Home size={20} />} trendValue="+8%" trendColorClass="text-green-500"
            bgClass="bg-blue-50" borderClass="border-blue-100" iconBgClass="bg-blue-100" iconColorClass="text-blue-600"
          />
          <StatCard 
            title="Total Bookings" value="0" subtext="0 active"
            icon={<Calendar size={20} />} trendValue="+15%" trendColorClass="text-green-500"
            bgClass="bg-green-50" borderClass="border-green-100" iconBgClass="bg-green-100" iconColorClass="text-green-600"
          />
        </div>

        {/* ... (Charts section remains identical to previous code, omitted for brevity but goes here) ... */}

        {/* Middle Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
          <MetricCard title="Total Revenue" value="NPR 0" icon={<DollarSign size={20} />} iconBgClass="bg-purple-50" iconColorClass="text-purple-600" />
          <MetricCard title="Approval Rate" value="33%" icon={<CheckCircle size={20} />} iconBgClass="bg-green-50" iconColorClass="text-green-600" />
          <MetricCard title="Avg. Review Time" value="2.5 hrs" icon={<Activity size={20} />} iconBgClass="bg-blue-50" iconColorClass="text-blue-600" />
        </div>

        {/* KYC Verifications List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">KYC Verifications</h3>
              <p className="text-sm text-gray-500">Review and manage user verifications</p>
            </div>
            <span className="bg-amber-50 text-amber-600 text-xs font-semibold px-3 py-1 rounded-full border border-amber-100">
              2 Pending
            </span>
          </div>
          
          <div className="flex border-b border-gray-200">
            <button className="flex-1 py-4 text-sm font-medium text-purple-600 border-b-2 border-purple-600 flex justify-center items-center gap-2 bg-purple-50/30">
              <Clock size={16} /> Pending <span className="bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </button>
            <button className="flex-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 flex justify-center items-center gap-2">
              <CheckCircle size={16} /> Approved <span className="bg-green-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">1</span>
            </button>
            <button className="flex-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 flex justify-center items-center gap-2">
              <X size={16} /> Rejected
            </button>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <KycListItem 
              name="Sita Thapa" role="Tenant" email="sita.thapa@email.com" phone="+977 9851234567"
              citizenship="03-02-85-54321" docsCount={1} submittedAt="Mar 14, 2026, 02:20 PM"
              avatarUrl="https://i.pravatar.cc/150?img=5"
            />
            <KycListItem 
              name="Rajesh Sharma" role="Landlord" email="rajesh.sharma@email.com" phone="+977 9841234567"
              citizenship="12-01-75-12345" docsCount={2} submittedAt="Mar 14, 2026, 10:30 AM"
              avatarUrl="https://i.pravatar.cc/150?img=11"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;