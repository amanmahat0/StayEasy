import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize, 
  Trash2, 
  Star 
} from "lucide-react";

// --- COMPONENTS ---
import PublicNavbar from "../../Navbar/PublicNavbar";
import Footer from "../../Footer";
import { getUserFavorites, removeFavorite } from "../../../services/api";

export default function Wishlist() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await getUserFavorites();
      setFavorites(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch favorites error:", error);
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId: number) => {
    try {
      await removeFavorite(propertyId);
      setFavorites(favorites.filter(fav => fav.property_info.id !== propertyId));
    } catch (error) {
      console.error("Remove favorite error:", error);
    }
  };

  const summary = {
    totalSaved: favorites.length,
    availableCount: favorites.filter(fav => fav.property_info.available).length,
    minPrice: favorites.length > 0 ? Math.min(...favorites.map(fav => parseFloat(fav.property_info.price))) : 0,
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-slate-900">
      <PublicNavbar />

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        
        {/* --- HEADER --- */}
        <div className="mb-8 text-left">
          <div className="flex items-center gap-2.5 mb-1">
            <Heart className="text-[#A989C8] fill-[#A989C8]" size={24} />
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              My Wishlist
            </h1>
          </div>
          <p className="text-slate-400 text-sm ml-1 font-medium">
            {summary.totalSaved} propert{summary.totalSaved !== 1 ? 'ies' : 'y'} saved
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Loading your favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">You haven't added any properties to your wishlist yet.</p>
          </div>
        ) : (
          <>
            {/* --- WISHLIST GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              
              {favorites.map((favorite) => {
                const prop = favorite.property_info;
                const imageUrl = prop.images?.[0]?.image ? `http://127.0.0.1:8000${prop.images[0].image}` : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800";
                
                return (
                  <div key={prop.id} className="group bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-md">
                    
                    {/* IMAGE SECTION */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={imageUrl} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        alt={prop.title} 
                      />
                      
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-bold text-slate-700 uppercase shadow-sm">
                          {prop.property_type}
                        </span>
                        {prop.available && (
                          <span className="bg-[#10B981] px-2 py-0.5 rounded-md text-[8px] font-bold text-white flex items-center gap-1">
                            <Star size={8} fill="currentColor" /> Available
                          </span>
                        )}
                      </div>

                      <button 
                        onClick={() => handleRemoveFavorite(prop.id)}
                        className="absolute top-3 right-3 p-1.5 bg-white rounded-full text-red-500 shadow-sm hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="absolute bottom-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase text-white shadow-lg ${
                          prop.has_confirmed_booking ? 'bg-[#FF9900]' : 'bg-[#4F46E5]'
                        }`}>
                          {prop.has_confirmed_booking ? 'Booked' : 'Available'}
                        </span>
                      </div>
                    </div>

                    {/* CONTENT SECTION */}
                    <div className="p-5 text-left">
                      <h3 className="font-bold text-base text-slate-900 mb-0.5 leading-tight line-clamp-1">
                        {prop.title}
                      </h3>
                      
                      <div className="flex items-center gap-1 text-slate-400 text-[10px] mb-4 font-medium">
                        <MapPin size={10} className="text-[#A989C8]" /> {prop.city}
                      </div>

                      {/* SPECS */}
                      <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold mb-5">
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                          <Bed size={12} className="text-slate-400" /> 2
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                          <Bath size={12} className="text-slate-400" /> 2
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                          <Maximize size={12} className="text-slate-400" /> 200
                        </div>
                      </div>

                      {/* PRICE ROW */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#A989C8] font-bold text-lg tracking-tight">
                              NPR {parseFloat(prop.price).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/property/${prop.id}`)}
                        className="w-full mt-4 py-3 bg-[#F5F3FF] text-[#A989C8] font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#A989C8] hover:text-white transition-all">
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- SUMMARY SECTION --- */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm text-left">
              <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">
                Wishlist Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#F5F3FF] py-6 rounded-[24px] text-center">
                  <p className="text-3xl font-bold text-[#A989C8] mb-0.5">{summary.totalSaved}</p>
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Saved</p>
                </div>
                <div className="bg-[#F0FDF4] py-6 rounded-[24px] text-center">
                  <p className="text-3xl font-bold text-[#10B981] mb-0.5">{summary.availableCount}</p>
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Available</p>
                </div>
                <div className="bg-[#EFF6FF] py-6 rounded-[24px] text-center">
                  <p className="text-3xl font-bold text-[#2563EB] mb-0.5">
                    {summary.totalSaved > 0 ? Math.floor(summary.minPrice / 1000) : 0}k
                  </p>
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Starting From</p>
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