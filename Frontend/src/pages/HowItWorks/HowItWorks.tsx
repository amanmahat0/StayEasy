import { Link } from "react-router-dom";
import { Search, Home, Calendar, CreditCard, CheckCircle, MessageCircle, ArrowRight, Shield } from "lucide-react";
import Footer from "../../components/Footer";

const steps = [
  {
    icon: <Search size={28} />,
    title: "Browse Properties",
    desc: "Explore listings by location, price, type, and amenities. Use filters to find your ideal rental home.",
  },
  {
    icon: <Home size={28} />,
    title: "View Details",
    desc: "Check property photos, pricing, availability, and location. Chat with the landlord directly for any questions.",
  },
  {
    icon: <Calendar size={28} />,
    title: "Book a Property",
    desc: "Select check-in and check-out dates, review the total price, and submit your booking request.",
  },
  {
    icon: <CreditCard size={28} />,
    title: "Pay Securely",
    desc: "Complete payment via eSewa (Nepal's trusted payment gateway). Your booking is confirmed instantly after payment.",
  },
  {
    icon: <CheckCircle size={28} />,
    title: "Move In",
    desc: "Once confirmed, you're all set! Use the chat to coordinate move-in details with your landlord.",
  },
  {
    icon: <MessageCircle size={28} />,
    title: "Stay Connected",
    desc: "Communicate with your landlord through in-app chat. Manage your bookings and payments from the dashboard.",
  },
];

const roles = [
  {
    role: "For Tenants",
    items: [
      "Sign up and complete KYC verification",
      "Browse and filter available properties",
      "Book with eSewa payment",
      "Chat with landlords in real-time",
      "Cancel bookings with transparent refunds",
    ],
  },
  {
    role: "For Landlords",
    items: [
      "Register as a landlord and list properties",
      "Manage bookings and view tenant details",
      "Receive eSewa payments directly",
      "Chat with prospective tenants",
      "Track payment history and handle refunds",
    ],
  },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col font-sans">
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#A989C8] rounded-xl flex items-center justify-center shadow-md">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">StayEasy</span>
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl border-2 border-[#A989C8] text-[#A989C8] font-medium text-sm hover:bg-[#A989C8] hover:text-white transition-all"
          >
            Login
          </Link>
        </div>
      </nav>

      <section className="bg-gradient-to-b from-[#A87DC2]/10 to-transparent pt-16 pb-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl font-extrabold text-[#1A1A1A] mb-4">How StayEasy Works</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Find, book, and manage rental properties in Nepal — all in one place.
          </p>
        </div>
      </section>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 -mt-10 mb-20">
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-14 h-14 bg-[#A87DC2]/10 rounded-2xl flex items-center justify-center text-[#A87DC2] shrink-0">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-[#A87DC2] uppercase tracking-widest">Step {i + 1}</span>
                    <ArrowRight size={12} className="text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {roles.map((role) => (
            <div key={role.role} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Shield size={22} className="text-[#A87DC2]" />
                <h2 className="text-xl font-bold text-gray-900">{role.role}</h2>
              </div>
              <ul className="space-y-3">
                {role.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to find your next home?</h2>
          <p className="text-gray-500 mb-6">Sign up free and start browsing properties today.</p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3.5 rounded-xl bg-[#A989C8] text-white font-bold text-base hover:bg-[#8d6aa9] transition-all shadow-lg shadow-[#A989C8]/20"
          >
            Get Started
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
