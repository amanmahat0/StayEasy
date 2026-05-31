import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from "../../components/Navbar/PublicNavbar";
import Footer from "../../components/Footer";
import { deleteProperty, updateProperty, getKYCStatus } from "../../services/api";
import { useProperties } from "../../context/PropertyContext";

interface Property {
  id: number;
  title: string;
  property_type: string;
  address?: string;
  city?: string;
  price: number;
  available: boolean;
  status?: string;
  images?: any[];
  main_image?: string;
  created_at?: string;
  has_confirmed_booking?: boolean;
}

interface MenuItem {
  label: string;
  action: (property: Property) => void;
  danger?: boolean;
}

const Properties = () => {
  const navigate = useNavigate();
  const { properties, loading, fetchProperties } = useProperties();
  const [activeTab, setActiveTab] = useState('allproperties');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  // Fetch properties and KYC status on mount
  useEffect(() => {
    fetchProperties();
    getKYCStatus().then((data) => setKycStatus(data?.status || null)).catch(() => {});
  }, [fetchProperties]);

  // Filter properties by search and tab
  const filteredProperties = properties.filter((p) => {
    let matchesTab = false;
    
    if (activeTab === 'allproperties') {
      matchesTab = true;
    } else if (activeTab === 'booked') {
      matchesTab = p.has_confirmed_booking === true;
    } else {
      matchesTab = p.status?.toLowerCase() === activeTab.toLowerCase();
    }
    
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.address?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Handle delete property
  const handleDeleteProperty = async (property: Property) => {
    setDeleteLoading(true);
    try {
      await deleteProperty(property.id);
      setShowDeleteConfirm(null);
      setOpenMenuId(null);
      // Refresh properties list
      await fetchProperties();
    } catch (error) {
      console.error('Failed to delete property:', error);
      alert('Failed to delete property. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle edit property
  const handleEditProperty = (property: Property) => {
    navigate(`/add-property/${property.id}`);
    setOpenMenuId(null);
  };

  // Handle toggle publish status
  const handleTogglePublish = async (property: Property) => {
    try {
      const newStatus = property.status?.toLowerCase() === 'published' ? 'draft' : 'published';
      await updateProperty(property.id, { status: newStatus });
      setOpenMenuId(null);
      // Refresh properties list
      await fetchProperties();
    } catch (error) {
      console.error('Failed to update property status:', error);
      alert('Failed to update property status');
    }
  };

  // Action menu items
  const getMenuItems = (property: Property): MenuItem[] => {
    const isPublished = property.status?.toLowerCase() === 'published';
    return [
      {
        label: isPublished ? 'Unpublish' : 'Publish',
        action: handleTogglePublish,
      },
      {
        label: 'Edit Property',
        action: handleEditProperty,
      },
      {
        label: 'Delete Property',
        action: (property) => setShowDeleteConfirm(property.id),
        danger: true,
      },
    ];
  };

  // Get image URL with proper backend path
  const getImageUrl = (property: Property): string => {
    if (property.main_image) {
      return `http://127.0.0.1:8000${property.main_image}`;
    }
    if (property.images && property.images.length > 0) {
      return `http://127.0.0.1:8000${property.images[0].image}`;
    }
    return 'https://via.placeholder.com/150';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
      <PublicNavbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        {/* 1. Header Section */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">Your Properties</h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">Manage and monitor all your listed properties</p>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="bg-white px-4 sm:px-6 py-6 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-grow">
            {/* Search Input */}
            <div className="relative mb-6">
              <span className="absolute inset-y-0 left-5 flex items-center text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input 
                type="text" 
                placeholder="Search properties by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#A989C8]/10 focus:border-[#A989C8] outline-none transition-all text-gray-600 placeholder:text-gray-300"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'allproperties', label: 'All Properties' },
                { id: 'draft', label: 'Draft' },
                { id: 'published', label: 'Published' },
                { id: 'booked', label: 'Booked' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-[#A989C8] text-white shadow-lg shadow-[#A989C8]/30' 
                        : 'bg-[#F1F3F6] text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}{tab.id === 'allproperties' && <span className="ml-1 opacity-70">({properties.length})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Property Button */}
          <div className="self-start lg:self-center w-full lg:w-auto">
            <button 
              onClick={() => {
                if (kycStatus === 'pending') {
                  alert('KYC verification is pending. Please wait for approval before adding properties.');
                } else if (kycStatus === 'rejected' || kycStatus === 'not_submitted') {
                  navigate('/kyc');
                } else {
                  navigate('/add-property');
                }
              }}
              disabled={kycStatus === 'pending'}
              className={`w-full lg:w-auto px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                kycStatus === 'pending'
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-[#A989C8] hover:bg-[#9674b5] text-white shadow-[#A989C8]/20'
              }`}
              title={kycStatus === 'pending' ? 'KYC verification required' : ''}
            >
              <span className="text-xl">+</span> Add Property
            </button>
            {kycStatus === 'pending' && (
              <p className="text-xs text-yellow-600 mt-2 text-center">KYC verification required before listing</p>
            )}
            {(kycStatus === 'rejected' || kycStatus === 'not_submitted') && (
              <p className="text-xs text-red-500 mt-2 text-center cursor-pointer hover:underline" onClick={() => navigate('/kyc')}>
                KYC required - Click to submit
              </p>
            )}
          </div>
        </div>

        {/* 3. Property Table */}
        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 relative">
          <table className="w-full text-left hidden md:table">
            <thead>
              <tr className="border-b border-gray-50 text-[11px] uppercase tracking-[0.1em] text-gray-400 font-black">
                <th className="px-8 py-6">Property</th>
                <th className="px-6 py-6">Type</th>
                <th className="px-6 py-6">Location</th>
                <th className="px-6 py-6">Rent</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-6 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 <tr><td colSpan={6} className="text-center py-20 text-gray-400 animate-pulse">Loading properties...</td></tr>
              ) : filteredProperties.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-20 text-gray-400 font-bold">No properties found.</td></tr>
              ) : filteredProperties.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <img 
                        src={getImageUrl(item)} 
                        className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-50" 
                        alt={item.title}
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                      />
                      <div>
                        <h4 className="font-bold text-[#2D3748] text-sm">{item.title}</h4>
                        <p className="text-gray-400 text-[10px] font-bold">ID: {item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-[#F3F0FF] text-[#A989C8] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">
                      {item.property_type || 'Room'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-gray-600 text-sm font-medium">
                    {item.city || item.address || 'N/A'}
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-900 text-sm">NPR {Number(item.price).toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                      item.status?.toLowerCase() === 'published' 
                        ? 'bg-green-50 text-green-500'
                        : item.status?.toLowerCase() === 'booked'
                        ? 'bg-blue-50 text-blue-500'
                        : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {item.status || 'published'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right relative">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        className="text-gray-300 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === item.id && (
                        <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-100 z-50 min-w-max">
                          {getMenuItems(item).map((menuItem, idx) => (
                            <button
                              key={idx}
                              onClick={() => menuItem.action(item)}
                              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                                menuItem.danger
                                  ? 'text-red-500 hover:bg-red-50'
                                  : 'text-gray-700 hover:bg-gray-50'
                              } border-b border-gray-50 last:border-b-0`}
                            >
                              {menuItem.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Mobile Property Cards */}
        <div className="md:hidden block space-y-4">
          {loading ? (
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 text-center text-gray-400 animate-pulse font-bold">Loading properties...</div>
          ) : filteredProperties.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 text-center text-gray-400 font-bold">No properties found.</div>
          ) : filteredProperties.map((item) => (
            <div key={item.id} className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-gray-100 relative">
              <div className="flex items-start gap-4">
                <img 
                  src={getImageUrl(item)} 
                  className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-50 shrink-0" 
                  alt={item.title}
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-[#2D3748] text-sm truncate">{item.title}</h4>
                      <p className="text-gray-400 text-[10px] font-bold">ID: {item.id}</p>
                    </div>
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className="text-gray-300 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100 shrink-0"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="bg-[#F3F0FF] text-[#A989C8] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">
                      {item.property_type || 'Room'}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                      item.status?.toLowerCase() === 'published' 
                        ? 'bg-green-50 text-green-500'
                        : item.status?.toLowerCase() === 'booked'
                        ? 'bg-blue-50 text-blue-500'
                        : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {item.status || 'published'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 font-medium">
                    {item.city || item.address || 'N/A'}
                  </div>
                  <div className="mt-1 font-bold text-gray-900 text-sm">NPR {Number(item.price).toLocaleString()}</div>
                </div>
              </div>

              {/* Dropdown Menu */}
              {openMenuId === item.id && (
                <div className="absolute right-4 top-16 bg-white rounded-lg shadow-lg border border-gray-100 z-50 min-w-max">
                  {getMenuItems(item).map((menuItem, idx) => (
                    <button
                      key={idx}
                      onClick={() => menuItem.action(item)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                        menuItem.danger
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      } border-b border-gray-50 last:border-b-0`}
                    >
                      {menuItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 4v2m9-11a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Property?</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete this property? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const property = properties.find(p => p.id === showDeleteConfirm);
                  if (property) {
                    handleDeleteProperty(property);
                  }
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Properties;