import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  MapPin, 
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
            {/* --- FAVORITES LIST (Horizontal Layout) --- */}
            <div className="flex flex-col gap-6 mb-16">
              {favorites.map((favorite) => {
                const prop = favorite.property_info;
                const imageUrl = prop.images?.[0]?.image ? `http://127.0.0.1:8000${prop.images[0].image}` : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267";
                
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

                    {/* Favorite Info */}
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
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                          prop.has_confirmed_booking 
                            ? 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]'
                            : 'bg-[#F0FDF4] text-[#10B981] border-[#DCFCE7]'
                        }`}>
                          <Star size={12} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">
                            {prop.has_confirmed_booking ? 'Booked' : 'Available'}
                          </span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5 text-left">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Property Type</p>
                          <p className="text-xs font-bold text-slate-700">{prop.property_type}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Rent</p>
                          <p className="text-sm font-bold text-[#A989C8] tracking-tight">
                            NPR {parseFloat(prop.price).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9xs] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                          <p className="text-xs font-bold text-slate-700">{prop.city}</p>
                        </div>
                      </div>

                      {/* Footer of the favorite card */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                        <button 
                          onClick={() => handleRemoveFavorite(prop.id)}
                          className="flex items-center gap-1.5 text-red-600 font-bold text-[10px] uppercase tracking-widest hover:opacity-70 transition-all"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                        
                        <button 
                          onClick={() => navigate(`/property/${prop.id}`)}
                          className="flex items-center gap-1.5 text-[#A989C8] font-bold text-[10px] uppercase tracking-widest hover:opacity-70 transition-all"
                        >
                          <Heart size={14} fill="currentColor" />
                          View Details
                        </button>
                      </div>
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