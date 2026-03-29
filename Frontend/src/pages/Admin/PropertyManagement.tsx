import React, { useState, useEffect } from 'react';
import { 
  Home, Search, CheckCircle2, 
  Clock, LayoutGrid, Building2
} from 'lucide-react';
import { Header } from '../../components/admin/Header';
import { adminGetAllProperties } from '../../services/api';

interface PropertyData {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  property_type: string;
  price: number;
  available: boolean;
  created_at: string;
  owner: number;
  images: Array<{
    id: number;
    image: string;
  }>;
}

const PropertyManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await adminGetAllProperties();
      setProperties(data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  // Filter properties based on search and type
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch = 
      prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || prop.property_type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Calculate stats
  const stats = [
    { label: 'Total Properties', value: properties.length, icon: <Home size={20} />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Rooms', value: properties.filter(p => p.property_type === 'room').length, icon: <Building2 size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Apartments', value: properties.filter(p => p.property_type === 'apartment').length, icon: <LayoutGrid size={20} />, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Houses', value: properties.filter(p => p.property_type === 'house').length, icon: <LayoutGrid size={20} />, color: 'bg-pink-50 text-pink-600' },
    { label: 'Available', value: properties.filter(p => p.available).length, icon: <CheckCircle2 size={20} />, color: 'bg-green-50 text-green-600' },
    { label: 'Rented', value: properties.filter(p => !p.available).length, icon: <Clock size={20} />, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12 font-sans text-gray-800">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <Home className="text-[#A989C8]" size={26} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Property Management</h1>
          </div>
          <p className="text-gray-500 font-medium ml-1">Manage all property listings and their availability</p>
        </div>

        {/* Stats Grid - Matches 6-column layout from screenshot */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 font-bold tracking-tight uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
              type="text" 
              placeholder="Search by title, location, or address..."
              className="w-full pl-14 pr-6 py-3.5 bg-gray-50/50 rounded-2xl outline-none focus:bg-white border border-gray-100 font-medium text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-8 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-600 hover:bg-gray-100 transition-all outline-none"
          >
            <option value="">All Types</option>
            <option value="room">Rooms</option>
            <option value="apartment">Apartments</option>
            <option value="house">Houses</option>
            <option value="land">Land</option>
          </select>
        </div>

        {/* Property List / Empty State */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm min-h-[450px] flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50">
            <h3 className="font-black text-gray-900 text-lg">{filteredProperties.length} Properties Found</h3>
          </div>
          
          {filteredProperties.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6">
                <Home size={48} className="text-gray-200" />
              </div>
              <h4 className="text-xl font-black text-gray-900 mb-2">No properties found</h4>
              <p className="text-gray-400 font-medium max-w-xs">Try adjusting your search or filter criteria to find specific listings.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 overflow-y-auto">
              {filteredProperties.map((property) => (
                <div key={property.id} className="px-8 py-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-6">
                    {/* Image */}
                    <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={`http://127.0.0.1:8000${property.images[0].image}`}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Home size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Property Info */}
                    <div className="flex-1">
                      <h4 className="font-black text-gray-900 text-base mb-1">{property.title}</h4>
                      <p className="text-gray-600 text-xs mb-2">{property.address}, {property.city}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={`px-3 py-1 rounded-lg font-bold ${property.available ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {property.available ? 'Available' : 'Booked'}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg font-bold uppercase">
                          {property.property_type}
                        </span>
                        <span className="text-gray-600 font-bold">NPR {property.price.toLocaleString()}/month</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase">Monthly Rate</p>
                      <p className="text-2xl font-black text-[#A989C8]">NPR {(property.price / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PropertyManagement;