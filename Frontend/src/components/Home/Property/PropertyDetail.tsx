import { useNavigate, useParams } from "react-router-dom";
import { 
  MapPin, Star, ShieldCheck, Share2, Heart, 
  Wifi, Droplets, Sofa, Shield, User, Car, Lock, CheckCircle2, Bath, Maximize
} from "lucide-react";
import PublicNavbar from "../../Navbar/PublicNavbar";
import Footer from "../../Footer"; // Uses your existing footer at E:\StayEasy\Frontend\src\components\Footer.tsx

export default function PropertyDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter">
      <PublicNavbar />
      
      <main className="max-w-[1280px] mx-auto px-6 py-6">
        {/* Breadcrumbs */}
        <nav className="flex text-[13px] text-gray-400 gap-2 mb-6">
          <span className="hover:underline cursor-pointer">Home</span> / 
          <span className="hover:underline cursor-pointer">Properties</span> / 
          <span className="text-gray-600 font-medium">Modern 2BHK Apartment in Thamel</span>
        </nav>

        {/* Title Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[32px] font-bold text-[#1A2238] mb-2 tracking-tight">Modern 2BHK Apartment in Thamel</h1>
            <div className="flex items-center gap-4 text-[14px]">
              <span className="flex items-center gap-1.5 text-gray-500 font-medium"><MapPin size={16} className="text-gray-400"/> Thamel, Kathmandu</span>
              <span className="flex items-center gap-1 font-bold text-gray-800">
                <Star size={16} className="text-[#F5A623] fill-[#F5A623]"/> 4.8 
                <span className="text-gray-400 font-normal ml-1">(24 reviews)</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#27AE60] font-bold uppercase tracking-wider text-[11px]">
                <ShieldCheck size={18}/> Verified Property
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[14px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition"><Share2 size={18}/> Share</button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[14px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition"><Heart size={18}/> Save</button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Side Content */}
          <div className="col-span-8 space-y-6">
            
            {/* IMAGE CONTAINER - EXACT MATCH TO SECOND SS */}
            <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="w-full h-[450px] rounded-[24px] overflow-hidden mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" 
                  className="w-full h-full object-cover" 
                  alt="Main View" 
                />
              </div>
              <div className="flex gap-4 h-24">
                <div className="w-36 rounded-2xl overflow-hidden border-2 border-[#A989C8]">
                  <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="w-36 rounded-2xl overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* About Section */}
            <section className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
              <h2 className="text-[22px] font-bold text-[#1A2238] mb-4">About this property</h2>
              <p className="text-gray-500 text-[15px] leading-relaxed mb-10">
                Beautiful modern apartment located in the heart of Thamel. Features 2 bedrooms, 1 bathroom, fully furnished with modern amenities.
              </p>
              <div className="flex gap-20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F8F7FF] rounded-xl flex items-center justify-center text-[#A989C8]"><Sofa size={24}/></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bedrooms</p><p className="font-bold text-lg text-gray-800">2</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F8F7FF] rounded-xl flex items-center justify-center text-[#A989C8]"><Bath size={24}/></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Bathrooms</p><p className="font-bold text-lg text-gray-800">1</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F8F7FF] rounded-xl flex items-center justify-center text-[#A989C8]"><Maximize size={24}/></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Area</p><p className="font-bold text-lg text-gray-800">850 sq.ft</p></div>
                </div>
              </div>
            </section>

            {/* Amenities Section */}
            <section className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
                <h2 className="text-[22px] font-bold text-[#1A2238] mb-8">Amenities</h2>
                <div className="grid grid-cols-2 gap-y-6">
                    <div className="flex items-center gap-3 text-gray-600 font-medium"><Wifi className="text-[#27AE60]" size={20}/> WiFi</div>
                    <div className="flex items-center gap-3 text-gray-600 font-medium"><Car className="text-[#27AE60]" size={20}/> Parking</div>
                    <div className="flex items-center gap-3 text-gray-600 font-medium"><Droplets className="text-[#27AE60]" size={20}/> Water 24/7</div>
                    <div className="flex items-center gap-3 text-gray-600 font-medium"><Lock className="text-[#27AE60]" size={20}/> Security</div>
                    <div className="flex items-center gap-3 text-gray-600 font-medium"><CheckCircle2 className="text-[#27AE60]" size={20}/> Furnished</div>
                </div>
            </section>

            {/* Host Section */}
            <section className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
                <h2 className="text-[22px] font-bold text-[#1A2238] mb-8">Hosted by Rajesh Sharma</h2>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-[#A989C8] rounded-full flex items-center justify-center text-white text-xl font-bold shadow-inner">R</div>
                    <div>
                        <p className="font-bold text-gray-900 text-[17px]">Rajesh Sharma</p>
                        <p className="text-sm text-gray-400 flex items-center gap-1.5 font-medium"><Star size={14} className="text-[#F5A623] fill-[#F5A623]"/> 4.9 rating · 12 properties</p>
                    </div>
                </div>
                <button className="w-full py-4 border border-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition text-sm">
                    Contact Owner
                </button>
            </section>
          </div>

          {/* Right Side Sidebar (Sticky) */}
          <div className="col-span-4">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/40 sticky top-24">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[2px] mb-2">Starting from</p>
              <div className="flex items-baseline gap-1.5 mb-8">
                <span className="text-[32px] font-black text-[#A989C8]">NPR 25,000</span>
                <span className="text-gray-400 font-bold text-sm">/month</span>
              </div>

              <div className="space-y-4 mb-8 border-b border-gray-50 pb-8">
                <h3 className="text-[13px] text-gray-900 font-black uppercase tracking-wider mb-2">Price Breakdown</h3>
                <div className="flex justify-between text-[14px] text-gray-500 font-medium"><span>Monthly Rent</span><span className="text-gray-900">NPR 25,000</span></div>
                <div className="flex justify-between text-[14px] text-gray-500 font-medium"><span>Security Deposit</span><span className="text-gray-900">NPR 50,000</span></div>
                <div className="flex justify-between text-[14px] text-gray-500 font-medium"><span>Service Fee (5%)</span><span className="text-gray-900">NPR 1,250</span></div>
                <div className="pt-4 flex justify-between text-[17px] font-bold text-[#A989C8]">
                    <span>Total (First month)</span>
                    <span className="font-black">NPR 76,250</span>
                </div>
              </div>

              <div className="mb-8">
                <label className="text-[11px] font-bold text-gray-800 uppercase block mb-3 tracking-widest">Move-in Date</label>
                <div className="relative">
                  <input type="date" className="w-full bg-[#F9FAFB] border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 cursor-pointer focus:ring-2 focus:ring-[#A989C8]/20" />
                </div>
              </div>

              <button 
                onClick={() => navigate(`/booking/${id || 1}`)}
                className="w-full py-5 bg-[#A989C8] hover:bg-[#9676B8] text-white font-black text-[16px] rounded-2xl shadow-lg shadow-purple-100 transition-all active:scale-[0.98] mb-4"
              >
                Book Now
              </button>
              <p className="text-center text-[11px] text-gray-400 font-bold">You won't be charged yet</p>

              <div className="mt-10 flex gap-4 bg-[#F1FAF5] p-5 rounded-2xl border border-[#E3F2E9]">
                <ShieldCheck className="text-[#27AE60] shrink-0" size={20}/>
                <div>
                  <p className="text-[13px] font-bold text-gray-800">Flexible cancellation</p>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-0.5">Get a full refund if you cancel at least 7 days before check-in</p>
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