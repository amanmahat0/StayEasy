import { Eye, CheckCircle2 } from "lucide-react";
import PublicNavbar from "../../Navbar/PublicNavbar"; // Adjust path if needed
import Footer from "../../Footer"; // Assuming you have a Footer component

const bookings = [
  {
    id: "booking_1773_",
    title: "Modern 2BHK Apartment in Thamel",
    location: "Thamel, Kathmandu",
    moveInDate: "Feb 4, 2026",
    duration: "12 months",
    totalAmount: "NPR 350,000",
    paymentStatus: "Paid",
    method: "Khalti",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    status: "Confirmed"
  },
  {
    id: "booking_1773_",
    title: "Cozy Single Room near Patan",
    location: "Patan, Lalitpur",
    moveInDate: "Mar 4, 5667",
    duration: "12 months",
    totalAmount: "NPR 112,000",
    paymentStatus: "Paid",
    method: "Khalti",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    status: "Confirmed"
  },
  {
    id: "booking_1773_",
    title: "Cozy Single Room near Patan",
    location: "Patan, Lalitpur",
    moveInDate: "Aug 8, 97654",
    duration: "12 months",
    totalAmount: "NPR 112,400",
    paymentStatus: "Paid",
    method: "Khalti",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    status: "Confirmed"
  }
];

export default function MyBooking() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-inter">
      <PublicNavbar />
      
      <main className="max-w-6xl mx-auto py-12 px-6">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-500 font-medium">View and manage all your property bookings</p>
        </header>

        <div className="space-y-6">
          {bookings.map((booking, index) => (
            <div 
              key={index} 
              className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm flex items-center gap-8 transition-hover hover:shadow-md transition-shadow"
            >
              {/* Image Thumbnail */}
              <div className="w-48 h-32 rounded-2xl overflow-hidden shrink-0">
                <img 
                  src={booking.image} 
                  alt={booking.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Booking Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.title}</h3>
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" /> {booking.location}
                    </p>
                  </div>
                  
                  {/* Status Tag */}
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-500 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">{booking.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Booking ID</p>
                    <p className="text-sm font-bold text-gray-700">{booking.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Move-In Date</p>
                    <p className="text-sm font-bold text-gray-700">{booking.moveInDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Duration</p>
                    <p className="text-sm font-bold text-gray-700">{booking.duration}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Amount</p>
                    <p className="text-sm font-bold text-[#A989C8]">{booking.totalAmount}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div className="flex gap-6 text-[11px] font-bold">
                    <p className="text-gray-400 uppercase">Payment: <span className="text-emerald-500 ml-1">{booking.paymentStatus}</span></p>
                    <p className="text-gray-400 uppercase">Method: <span className="text-gray-700 ml-1">{booking.method}</span></p>
                  </div>
                  
                  <button className="flex items-center gap-2 text-[#A989C8] font-bold text-xs hover:text-[#9677b4] transition-colors">
                    <Eye size={16} />
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}