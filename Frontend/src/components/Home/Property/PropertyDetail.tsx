import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import {
  MapPin,
  Star,
  ShieldCheck,
  Share2,
  Heart,
  Wifi,
  Droplets,
  Sofa,
  Car,
  Lock,
  CheckCircle2,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
} from "lucide-react";

import PublicNavbar from "../../Navbar/PublicNavbar";
import Footer from "../../Footer";
import PropertyMapDisplay from '../../Map/PropertyMapDisplay';
import { getPropertyDetail } from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";
import chatService from "../../../services/chatService";

export default function PropertyDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const authContext = useContext(AuthContext);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (!id) {
          setError("Property ID not found");
          return;
        }
        const data = await getPropertyDetail(Number(id));
        setProperty(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <PublicNavbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#A989C8] rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-600 text-lg font-medium">Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <PublicNavbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
            <p className="text-red-500 text-lg font-medium mb-4">{error || "Property not found"}</p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-2 bg-[#A989C8] text-white rounded-lg font-medium hover:bg-[#8d6aa9] transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [{ image: "/no-image.png" }];
  const currentImage = images[currentImageIndex];
  const imageUrl = currentImage?.image
    ? currentImage.image.startsWith("http")
      ? currentImage.image
      : `http://127.0.0.1:8000${currentImage.image}`
    : "/no-image.png";

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const amenities = [
    { icon: Wifi, label: "WiFi", available: true },
    { icon: Car, label: "Parking", available: true },
    { icon: Droplets, label: "Water 24/7", available: true },
    { icon: Lock, label: "Security", available: true },
    { icon: Sofa, label: "Furnished", available: true },
    { icon: CheckCircle2, label: "Balcony", available: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PublicNavbar />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <nav className="flex text-sm text-gray-500 gap-2 mb-8">
          <button onClick={() => navigate("/home")} className="hover:text-[#A989C8] transition font-medium">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/properties")} className="hover:text-[#A989C8] transition font-medium">Properties</button>
          <span>/</span>
          <span className="text-gray-700 font-semibold">{property.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="relative w-full h-[500px] bg-gray-200 overflow-hidden group">
                <img src={imageUrl} alt={property.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                  onClick={() => setShowLightbox(true)} onError={(e) => { e.currentTarget.src = "/no-image.png"; }} />
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition">
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition">
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">{currentImageIndex + 1} / {images.length}</div>
                <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"><Maximize className="w-4 h-4" /> Click to zoom</div>
              </div>
              {images.length > 1 && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img: any, idx: number) => (
                      <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`min-w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition ${idx === currentImageIndex ? "border-[#A989C8] shadow-lg" : "border-gray-200 hover:border-[#A989C8]"}`}>
                        <img src={img.image?.startsWith("http") ? img.image : `http://127.0.0.1:8000${img.image}`} alt={`${property.title} ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/no-image.png"; }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

{showLightbox && (
  <div
    className="fixed inset-0 z-40 flex flex-col items-center justify-center"
    style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(40px)" }}
    onClick={() => setShowLightbox(false)}
  >
    <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-gray-500 text-sm" style={{ background: "rgba(0,0,0,0.06)", border: "0.5px solid rgba(0,0,0,0.08)" }}>
      {currentImageIndex + 1} / {images.length}
    </div>

    <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <img
        src={imageUrl}
        alt={property.title}
        style={{ maxHeight: "80vh", maxWidth: "75vw", borderRadius: "20px", objectFit: "contain", display: "block" }}
        onError={(e) => { e.currentTarget.src = "/no-image.png"; }}
      />
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute -left-16 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(0,0,0,0.08)", border: "0.5px solid rgba(0,0,0,0.1)" }}>
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute -right-16 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(0,0,0,0.08)", border: "0.5px solid rgba(0,0,0,0.1)" }}>
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}
    </div>

    <div className="absolute bottom-8 flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((_: any, idx: number) => (
            <button key={idx} onClick={() => setCurrentImageIndex(idx)} className="rounded-full transition-all duration-300" style={{ width: idx === currentImageIndex ? "24px" : "7px", height: "7px", background: idx === currentImageIndex ? "#A989C8" : "rgba(0,0,0,0.2)" }} />
          ))}
        </div>
      )}
    </div>
  </div>
)}

            {/* Header */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{property.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                  <span className="flex items-center gap-2 text-gray-600"><MapPin className="w-5 h-5 text-[#A989C8]" /> {property.city}</span>
                  <span className="flex items-center gap-2 text-yellow-500 font-semibold"><Star className="w-5 h-5 fill-yellow-500" /> 4.8 (24 reviews)</span>
                  <span className="flex items-center gap-2 text-green-600 font-semibold"><ShieldCheck className="w-5 h-5" /> Verified</span>
                </div>
              </div>
              <div className="flex gap-3 mb-6">
                <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"><Share2 className="w-5 h-5" /> Share</button>
                <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"><Heart className="w-5 h-5" /> Save</button>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <p className="text-gray-600 text-sm font-medium mb-2">Monthly Rent</p>
                <p className="text-5xl font-bold text-[#A989C8] mb-4">NPR {parseInt(property.price).toLocaleString()}<span className="text-2xl text-gray-500 font-normal">/month</span></p>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this property</h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">{property.description || `Beautiful ${property.property_type} located in ${property.city}. Fully furnished with modern amenities and excellent location.`}</p>
              <div className="grid grid-cols-3 gap-6 border-t border-gray-200 pt-6">
                <div><p className="text-gray-500 text-sm font-medium mb-2">Type</p><p className="text-xl font-bold text-gray-900">{property.property_type}</p></div>
                <div><p className="text-gray-500 text-sm font-medium mb-2">Location</p><p className="text-xl font-bold text-gray-900">{property.city}</p></div>
                
                <div>
  <p className="text-gray-500 text-sm font-medium mb-2">Status</p>
  <p className={`text-xl font-bold capitalize ${
    property.status === "available" ? "text-green-600" :
    property.status === "pending" ? "text-yellow-500" :
    property.status === "booked" ? "text-red-500" :
    "text-green-600"
  }`}>
    {property.status || "Available"}
  </p>
</div>

              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {amenities.map((amenity, idx) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-transparent rounded-xl border border-purple-100">
                      <div className="w-12 h-12 bg-[#A989C8] rounded-lg flex items-center justify-center"><Icon className="w-6 h-6 text-white" /></div>
                      <span className="font-semibold text-gray-800">{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

{/* Owner */}
<div className="bg-white rounded-3xl shadow-lg p-8">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">
    Hosted by {property.owner_name || "Owner"}
  </h2>

  <div className="flex items-start justify-between mb-8">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-gradient-to-br from-[#A989C8] to-[#8d6aa9] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
        {property.owner_name?.charAt(0)?.toUpperCase() || "O"}
      </div>

      <div>
        <p className="text-xl font-bold text-gray-900">
          {property.owner_name || "Property Owner"}
        </p>

        <p className="text-gray-600 flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          4.9 rating · 12 properties
        </p>
      </div>
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <button
      onClick={async () => {
        if (!authContext?.user) {
          navigate("/login");
          return;
        }

        try {
          const response =
            await chatService.createConversation(
              property.owner_id
            );

          if (!response) return;

          navigate("/messages", {
            state: {
              roomId: response.room_id,
            },
          });
        } catch (err) {
          console.error(
            "Failed to create conversation",
            err
          );
        }
      }}
      className="flex items-center justify-center gap-2 py-4 bg-[#A989C8] hover:bg-[#8d6aa9] text-white font-bold rounded-xl transition shadow-lg"
    >
      <MessageCircle className="w-5 h-5" />
      Chat with Owner
    </button>

    <button className="flex items-center justify-center gap-2 py-4 border-2 border-[#A989C8] text-[#A989C8] hover:bg-[#A989C8] hover:text-white font-bold rounded-xl transition">
      <Phone className="w-5 h-5" />
      Call Owner
    </button>
  </div>

  <p className="text-xs text-gray-400 text-center mt-4">
    Direct communication with property owner • Response within 2 hours
  </p>
</div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <p className="text-gray-600 text-sm font-medium mb-2">Starting from</p>
                <p className="text-4xl font-bold text-[#A989C8] mb-6">NPR {parseInt(property.price).toLocaleString()}<span className="text-lg text-gray-500 font-normal block">/month</span></p>
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600"><span>Monthly Rent</span><span className="font-semibold text-gray-900">NPR {parseInt(property.price).toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm text-gray-600"><span>Security Deposit</span><span className="font-semibold text-gray-900">NPR {(parseInt(property.price) * 2).toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm text-gray-600"><span>Service Fee (5%)</span><span className="font-semibold text-gray-900">NPR {(parseInt(property.price) * 0.05).toLocaleString()}</span></div>
                </div>
                <div className="flex justify-between mb-6"><span className="font-bold text-gray-900">Total (First Month)</span><span className="text-2xl font-bold text-[#A989C8]">NPR {(parseInt(property.price) * 3.05).toLocaleString()}</span></div>
                <div className="mb-6"><label className="text-xs font-bold text-gray-700 uppercase block mb-2">Move-in Date</label><input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A989C8]" /></div>
                <button onClick={() => id && navigate(`/booking/${id}`)} className="w-full py-4 bg-[#A989C8] hover:bg-[#8d6aa9] text-white font-bold rounded-xl shadow-lg transition mb-3">Book Now</button>
                <p className="text-xs text-gray-500 text-center mb-6">You won't be charged yet</p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3"><ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><div><p className="font-bold text-gray-900 text-sm">Flexible cancellation</p><p className="text-xs text-gray-600 mt-1">Full refund if you cancel 7 days before check-in</p></div></div>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="h-80">
                  {property && property.city ? (
                    <PropertyMapDisplay 
                      latitude={property?.latitude}
                      longitude={property?.longitude}
                      propertyTitle={property?.title || 'Property'}
                      city={property?.city}
                      address={property?.address || ''}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A989C8] mx-auto mb-3"></div>
                        <p className="text-gray-600">Loading location...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#A989C8] to-[#8d6aa9] rounded-3xl shadow-lg p-6 text-white">
                <h3 className="font-bold mb-4">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> <span>Instant confirmation</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> <span>Verified landlord</span></div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> <span>24/7 Support</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
