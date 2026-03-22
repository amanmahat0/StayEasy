import { ArrowLeft } from "lucide-react";

export default function Details({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-bold text-sm mb-6 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        BACK
      </button>

      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-8 space-y-6">
          <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Booking Details</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Move-in Date *</label>
                <input type="date" className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#A989C8]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Lease Duration</label>
                <input placeholder="12 months" className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Full Name *</label>
                <input placeholder="Enter your full name" className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Email Address *</label>
                  <input placeholder="your.email@example.com" className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Phone Number *</label>
                  <input placeholder="+977 98XXXXXXXX" className="w-full p-4 bg-white border border-gray-200 rounded-2xl outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Cancellation Policy</h2>
            <div className="space-y-3">
              {[
                { label: "≥7 days before", value: "80% refund" },
                { label: "3-6 days before", value: "50% refund" },
                { label: "1-2 days before", value: "0% refund" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between p-4 bg-gray-50 rounded-2xl text-sm font-bold">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="text-[#A989C8]">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-amber-50 rounded-2xl flex gap-3 items-center text-xs text-amber-700 font-medium">
               <div className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center font-bold">!</div>
               Please review the cancellation policy carefully before booking.
            </div>
          </div>

          <button onClick={onNext} className="w-full py-5 bg-[#A989C8] text-white font-bold rounded-2xl shadow-xl shadow-purple-100">
            Proceed to Payment
          </button>
        </div>

        <div className="col-span-4 sticky top-24">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" className="w-full h-44 object-cover rounded-2xl mb-6" alt="Property" />
            <h4 className="font-bold text-gray-900 mb-1">Modern 2BHK Apartment in Thamel</h4>
            <p className="text-xs text-gray-400 mb-6">Thamel, Kathmandu</p>
            <div className="space-y-3 text-sm border-t pt-6">
              <div className="flex justify-between text-gray-500 font-medium"><span>Rent (12 months)</span><span className="text-gray-900 font-bold">NPR 300,000</span></div>
              <div className="flex justify-between text-gray-500 font-medium"><span>Security Deposit</span><span className="text-gray-900 font-bold">NPR 50,000</span></div>
              <div className="flex justify-between text-gray-500 font-medium"><span>Service Fee</span><span className="text-gray-900 font-bold">NPR 1,250</span></div>
              <div className="flex justify-between pt-3 border-t">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-black text-[#A989C8]">NPR 351,250</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}