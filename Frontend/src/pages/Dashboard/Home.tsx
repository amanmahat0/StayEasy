import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Heart,
  SlidersHorizontal,
  Grid,
  List,
  Calendar,
} from "lucide-react";

import PublicNavbar from "../../components/Navbar/PublicNavbar";
import Footer from "../../components/Footer";
import { getProperties } from "../../services/api";

interface PropertyData {
  id: number;
  title: string;
  address: string;
  city: string;
  property_type: string;
  price: number;
  available: boolean;
  owner: number;
  created_at: string;
  description: string;
  images: Array<{
    id: number;
    image: string;
  }>;
}

export default function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      setProperties([]);
    }
  };

  const filteredProperties = properties.filter((property) => {
    if (selectedType === "All") return true;
    return property.property_type.toLowerCase() === selectedType.toLowerCase();
  });

  const getPropertyTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      "room": "ROOM",
      "apartment": "APARTMENT",
      "house": "HOUSE",
      "land": "LAND",
    };
    return typeMap[type.toLowerCase()] || type.toUpperCase();
  };

  const getPropertyImage = (property: PropertyData) => {
    if (property.images && property.images.length > 0) {
      return `http://127.0.0.1:8000${property.images[0].image}`;
    }
    // Fallback placeholder
    return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-inter">
      <PublicNavbar />

      <main className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Available Properties</h1>
          <p className="text-gray-500 font-medium">{filteredProperties.length} properties found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-8 text-lg font-bold text-gray-800">
                <SlidersHorizontal size={18} className="text-[#A989C8]" />
                Filters
              </div>

              <div className="mb-8">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">Property Type</label>
                {["All", "Room", "Apartment", "House", "Land"].map((type) => (
                  <label key={type} className="flex items-center gap-3 mb-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="type" 
                      checked={selectedType === type}
                      onChange={() => setSelectedType(type)}
                      className="w-4 h-4 accent-[#A989C8] cursor-pointer" 
                    />
                    <span className={`text-sm font-medium transition ${selectedType === type ? "text-[#A989C8]" : "text-gray-500"}`}>
                      {type}
                    </span>
                  </label>
                ))}
              </div>

              <div className="mb-8">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">Price Range (NPR/month)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Min price" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none" />
                  <input placeholder="Max price" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none" />
                </div>
              </div>

              <div className="mb-8">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">Location</label>
                <input placeholder="Search location..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none" />
              </div>

              <div className="mb-8">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4">Availability</label>
                <input className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none" type="date" />
              </div>

              <label className="flex items-center gap-3 mb-8 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#A989C8]" />
                <span className="text-xs font-bold text-gray-600">Verified properties only</span>
              </label>

              <button 
                onClick={() => setSelectedType("All")}
                className="w-full py-4 text-xs font-black text-gray-400 border border-gray-100 rounded-xl hover:bg-gray-50 transition uppercase tracking-widest"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Listings Area */}
          <div className="flex-1">
            <div className="flex justify-end gap-2 mb-8 items-center">
              <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition ${viewMode === 'grid' ? 'bg-[#A989C8] text-white shadow-lg shadow-purple-100' : 'bg-white border text-gray-400'}`}><Grid size={20} /></button>
              <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-xl transition ${viewMode === 'list' ? 'bg-[#A989C8] text-white shadow-lg shadow-purple-100' : 'bg-white border text-gray-400'}`}><List size={20} /></button>
            </div>

            <div className={`grid gap-8 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {filteredProperties.length === 0 ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <p className="text-gray-500">No properties found</p>
                </div>
              ) : (
                filteredProperties.map((property) => (
                  <div key={property.id} className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                    {/* Image Container */}
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={getPropertyImage(property)} 
                        alt={property.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${property.available ? 'bg-emerald-500' : 'bg-orange-400'}`}>
                          {property.available ? 'Available' : 'Booked'}
                        </span>
                      </div>

                      {/* Heart Icon */}
                      <button className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                        <Heart size={18} />
                      </button>

                      {/* Property Type Badge */}
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">
                          {getPropertyTypeLabel(property.property_type)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <h3 className="font-bold text-xl text-gray-800 tracking-tight mb-1">{property.title}</h3>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-6">
                        <MapPin size={12} /> {property.city || property.address}
                      </div>

                      <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-1">
                              <span className="text-gray-600 text-sm font-bold">Property Type</span>
                          </div>
                          <span className="text-gray-400 text-[10px] font-bold flex items-center gap-1.5"><Calendar size={14}/> View Calendar</span>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <div>
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Starting from</span>
                          <div className="flex items-baseline gap-1">
                              <span className="text-[#A989C8] font-black text-2xl">NPR {property.price.toLocaleString()}</span>
                              <span className="text-gray-400 text-xs font-bold">/month</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/property/${property.id}`)}
                          className="bg-[#A989C8] hover:bg-[#9370DB] text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-50 transition-all active:scale-95"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}