import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Heart, SlidersHorizontal, Grid, List } from "lucide-react";

// **Imports for API and Layout**
import PublicNavbar from "../../components/Navbar/PublicNavbar";
import Footer from "../../components/Footer";
import { getProperties, getUserFavorites, addFavorite, removeFavorite } from "../../services/api";

export default function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedType, setSelectedType] = useState("All");
  const [loading, setLoading] = useState(false);

  // **Fetch favorites and properties on component mount**
  useEffect(() => {
    fetchFavorites();
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const data = await getUserFavorites();
      // Normalize IDs and ensure we only keep numbers so the Set is typed as Set<number>
      const ids = (data || [])
        .map((fav: any) => fav?.property_info?.id ?? fav?.property?.id)
        .filter((id: any): id is number => typeof id === "number");
      const favoriteIds = new Set<number>(ids);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error("Favorites fetch error:", error);
    }
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, propertyId: number) => {
    e.stopPropagation();
    setLoading(true);
    
    try {
      if (favorites.has(propertyId)) {
        // Remove from favorites
        await removeFavorite(propertyId);
        setFavorites(prev => {
          const updated = new Set(prev);
          updated.delete(propertyId);
          return updated;
        });
      } else {
        // Add to favorites
        await addFavorite(propertyId);
        setFavorites(prev => new Set([...prev, propertyId]));
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyClick = (propertyId: number) => {
    navigate(`/property/${propertyId}`);
  };

  const filteredProperties = properties.filter((p) => 
    selectedType === "All" || p.property_type.toLowerCase() === selectedType.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-[#2D3748]">
      <PublicNavbar />

      <main className="max-w-[1400px] mx-auto px-10 py-12">
        {/* **Header matching the image typography** */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#1A202C] tracking-tight">Available Properties</h1>
          <p className="text-gray-500 text-sm mt-2">{filteredProperties.length} properties found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* **Sidebar with Circular Radio Filters** */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm sticky top-24">
              <div className="flex items-center gap-3 mb-8 text-lg font-bold text-[#1A202C]">
                <SlidersHorizontal size={18} className="text-[#A989C8]" />
                Filters
              </div>

              {/* **Property Type with the Circle Indicators** */}
              <div className="mb-10">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-6">Property Type</label>
                <div className="space-y-5">
                  {["All", "Room", "Flat", "Land", "House"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className="flex items-center gap-3 w-full group"
                    >
                      {/* **Custom Circle Indicator** */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedType === type ? "border-[#A989C8]" : "border-gray-300 group-hover:border-gray-400"
                      }`}>
                        {selectedType === type && <div className="w-2.5 h-2.5 bg-[#A989C8] rounded-full" />}
                      </div>
                      <span className={`text-sm font-semibold ${selectedType === type ? "text-[#A989C8]" : "text-gray-500"}`}>
                        {type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* **Price Range Inputs** */}
              <div className="mb-10">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-5">Price Range (NPR/Month)</label>
                <div className="flex gap-2">
                  <input placeholder="Min price" className="w-full px-4 py-3 bg-[#F8F9FB] rounded-xl text-xs border-none outline-none" />
                  <input placeholder="Max price" className="w-full px-4 py-3 bg-[#F8F9FB] rounded-xl text-xs border-none outline-none" />
                </div>
              </div>

              <button 
                onClick={() => setSelectedType("All")}
                className="w-full py-4 text-[10px] font-bold text-gray-400 border border-gray-100 rounded-2xl hover:bg-gray-50 transition uppercase tracking-widest"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* **Properties Listing Area** */}
          <div className="flex-1">
            {/* **View Switcher** */}
            <div className="flex justify-end gap-2 mb-8">
              <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition ${viewMode === 'grid' ? 'bg-[#A989C8] text-white' : 'bg-white border text-gray-300'}`}><Grid size={18} /></button>
              <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-xl transition ${viewMode === 'list' ? 'bg-[#A989C8] text-white' : 'bg-white border text-gray-300'}`}><List size={18} /></button>
            </div>

            {/* **Property Cards** */}
            <div className={`grid gap-8 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {filteredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                  
                  {/* **Image Section with Badges** */}
                  <div className="relative h-56 overflow-hidden bg-gray-100 group">
                    <img 
                      src={`http://127.0.0.1:8000${property.images[0]?.image}`} 
                      alt={property.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                      onError={(e) => {
                        e.currentTarget.src = "/no-image.png";
                        e.currentTarget.classList.add("bg-gray-200");
                      }}
                    />
                    
                    {/* **Status Badge (AVAILABLE/BOOKED)** */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase text-white ${property.has_confirmed_booking ? 'bg-[#FF9900]' : 'bg-[#10B981]'}`}>
                        {property.has_confirmed_booking ? 'Booked' : 'Available'}
                      </span>
                    </div>

                    {/* **Type Badge (Bottom Left Overlay)** */}
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-white px-4 py-1 rounded-lg text-[9px] font-bold uppercase text-[#1A202C] shadow-sm">
                        {property.property_type}
                      </span>
                    </div>

                    {/* **Wishlist Heart** */}
                    <button 
                      onClick={(e) => handleFavoriteToggle(e, property.id)}
                      disabled={loading}
                      className={`absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-colors ${
                        favorites.has(property.id) 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-300 hover:text-red-500'
                      }`}
                    >
                      <Heart size={16} fill={favorites.has(property.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* **Content Area** */}
                  <div className="p-7">
                    <h3 className="font-bold text-lg text-[#1A202C] mb-1 line-clamp-1 leading-tight">{property.title}</h3>
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-5">
                      <MapPin size={12} /> <span className="truncate">{property.city}</span>
                    </div>

                    <div className="text-xs text-gray-500 font-semibold mb-8">
                      {property.property_type === 'Land' ? 'Property Details' : '2 Bed • 2 Bath'}
                    </div>

                    {/* **Footer of card** */}
                    <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Per Month</p>
                        <p className="text-[#A989C8] font-bold text-lg">NPR {property.price.toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => handlePropertyClick(property.id)}
                        className="bg-[#A989C8] hover:bg-[#9171B3] text-white px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}