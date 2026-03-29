import React, { useState } from 'react';
import { 
  Calendar, Search, Filter, DollarSign, Clock, CheckCircle2, 
  XCircle, FileText, TrendingUp, CreditCard
} from 'lucide-react';
import { Header } from '../../components/admin/Header';

const BookingManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const topStats = [
    { label: 'Total Bookings', value: '0', icon: <Calendar size={22} />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Pending', value: '0', icon: <Clock size={22} />, color: 'bg-orange-50 text-orange-600' },
    { label: 'Active', value: '0', icon: <CheckCircle2 size={22} />, color: 'bg-blue-50 text-blue-600' },
  ];

  const statusIndicators = [
    { label: 'Confirmed', count: 0, color: 'bg-green-500' },
    { label: 'Completed', count: 0, color: 'bg-blue-500' },
    { label: 'Cancelled', count: 0, color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12 font-sans text-gray-800">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <Calendar className="text-[#A989C8]" size={26} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Booking Management</h1>
          </div>
          <p className="text-gray-500 font-medium ml-1">Manage all property bookings and reservations</p>
        </div>

        {/* Main Stats Row - Matches 4-card layout with Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {topStats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-44">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-4xl font-black text-gray-900 leading-none mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400 font-bold tracking-tight uppercase">{stat.label}</p>
              </div>
            </div>
          ))}
          
          {/* Featured Revenue Card */}
          <div className="bg-[#E9F5F1] p-8 rounded-[2rem] border border-green-100 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-green-600 shadow-sm z-10">
              <DollarSign size={22} />
            </div>
            <div className="z-10">
              <p className="text-3xl font-black text-gray-900 tracking-tight mb-1">NPR 0K</p>
              <p className="text-sm text-green-700/70 font-bold tracking-tight uppercase">Total Revenue</p>
            </div>
            {/* Background Decoration */}
            <TrendingUp className="absolute -right-4 -bottom-4 text-green-200/40" size={120} />
          </div>
        </div>

        {/* Status Breakdown Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {statusIndicators.map((status, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center px-8">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${status.color} animate-pulse`} />
                <span className="text-sm font-black text-gray-500 uppercase tracking-widest">{status.label}</span>
              </div>
              <span className="text-xl font-black text-gray-900">{status.count}</span>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              type="text" 
              placeholder="Search by booking ID, property name, or location..."
              className="w-full pl-14 pr-6 py-3.5 bg-gray-50/50 rounded-2xl outline-none focus:bg-white border border-gray-100 font-medium text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-600">
            <Filter size={18} /> All Bookings
          </button>
        </div>

        {/* Bookings List / Empty State */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[400px] flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50">
            <h3 className="font-black text-gray-900 text-lg">0 Bookings Found</h3>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
              <Calendar size={48} className="text-gray-200" />
            </div>
            <h4 className="text-xl font-black text-gray-900 mb-2">No bookings found</h4>
            <p className="text-gray-400 font-medium max-w-xs">There are currently no reservations to display.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookingManagement;