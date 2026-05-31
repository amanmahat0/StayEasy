import { useState, useEffect } from "react";
import { 
  Clock, 
  MapPin, 
  Eye
} from "lucide-react";

// --- COMPONENTS ---
import PublicNavbar from "../../Navbar/PublicNavbar";
import Footer from "../../Footer";
import { getViewedProperties } from "../../../services/api";
import { API_BASE } from "../../../config";

export default function ViewedProperties() {
  const [viewedProperties, setViewedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViewedProperties();
  }, []);

  const fetchViewedProperties = async () => {
    try {
      const data = await getViewedProperties();
      setViewedProperties(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch viewed properties error:", error);
      setLoading(false);
    }
  };

  const formatLastViewed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-900">
      <PublicNavbar />

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        
        {/* --- HEADER --- */}
        <div className="mb-8 text-left">
          <div className="flex items-center gap-2.5 mb-1">
            <Eye className="text-[#A989C8]" size={24} />
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Recently Viewed
            </h1>
          </div>
          <p className="text-slate-400 text-sm ml-1 font-medium">
            {viewedProperties.length} propert{viewedProperties.length !== 1 ? 'ies' : 'y'} viewed
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Loading your viewed properties...</p>
          </div>
        ) : viewedProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">You haven't viewed any properties yet.</p>
          </div>
        ) : (
          <>
            {/* --- VIEWED PROPERTIES LIST --- */}
            <div className="flex flex-col gap-6">
              {viewedProperties.map((viewed) => {
                const prop = viewed.property_info;
                const imageUrl = prop.images?.[0]?.image ? `${API_BASE}${prop.images[0].image}` : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800";
                
                return (
                  <div 
                    key={prop.id} 
                    className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 transition-all hover:shadow-md"
                  >
                    {/* Image Thumbnail */}
                    <div className="w-full md:w-56 h-36 rounded-[18px] overflow-hidden shrink-0 border border-slate-50">
                      <img 
                        src={imageUrl} 
                        alt={prop.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Property Info */}
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-left">
                          <h3 className="text-lg font-bold text-slate-900 mb-0.5 leading-tight">
                            {prop.title}
                          </h3>
                          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium">
                            <MapPin size={10} className="text-[#A989C8]" /> {prop.city}
                          </div>
                        </div>
                        
                        {/* Status Tag */}
                        <div className={`flex items-center gap-1.5 ${
                          prop.has_confirmed_booking ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#F0FDF4] text-[#10B981]'
                        } px-3 py-1 rounded-full border`}>
                          <Eye size={12} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">
                            {prop.has_confirmed_booking ? 'Booked' : 'Available'}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 text-left">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Property Type</p>
                          <p className="text-xs font-bold text-slate-700 capitalize">{prop.property_type}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price/Month</p>
                          <p className="text-xs font-bold text-[#A989C8]">NPR {parseFloat(prop.price).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">View Count</p>
                          <p className="text-xs font-bold text-slate-700">{viewed.view_count} time{viewed.view_count !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Viewed</p>
                          <p className="text-xs font-bold text-slate-700">{formatLastViewed(viewed.last_viewed)}</p>
                        </div>
                      </div>

                      {/* Footer of the card */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold">
                          <Clock size={12} className="text-[#A989C8]" />
                          <span>Last viewed {formatLastViewed(viewed.last_viewed)}</span>
                        </div>
                        
                        <button className="flex items-center gap-1.5 text-[#A989C8] font-bold text-[10px] uppercase tracking-widest hover:opacity-70 transition-all">
                          <Eye size={14} />
                          View Property
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- SUMMARY SECTION --- */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm text-left mt-12">
              <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">
                View History Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#F5F3FF] py-6 rounded-[24px] text-center">
                  <p className="text-3xl font-bold text-[#A989C8] mb-0.5">{viewedProperties.length}</p>
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Viewed</p>
                </div>
                <div className="bg-[#F0FDF4] py-6 rounded-[24px] text-center">
                  <p className="text-3xl font-bold text-[#10B981] mb-0.5">
                    {viewedProperties.filter(v => v.property_info.available).length}
                  </p>
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Available</p>
                </div>
                <div className="bg-[#EFF6FF] py-6 rounded-[24px] text-center">
                  <p className="text-3xl font-bold text-[#2563EB] mb-0.5">
                    {viewedProperties.reduce((sum, v) => sum + v.view_count, 0)}
                  </p>
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Total Views</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
