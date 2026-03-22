import { CheckCircle, Download, FileSignature } from "lucide-react";

export default function Success({ onSignAgreement }: { onSignAgreement: () => void }) {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[40px] p-12 shadow-sm border border-gray-50 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100">
          <CheckCircle size={40} />
        </div>
      </div>
      <h1 className="text-4xl font-black text-gray-900 mb-4">Booking Confirmed!</h1>
      <p className="text-gray-500 mb-10 max-w-md mx-auto font-medium">Your booking has been successfully confirmed. We've sent the details to your email.</p>

      <div className="bg-gray-50 rounded-[32px] p-8 mb-10 text-left space-y-4">
        <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-4 mb-4">Booking Details</h3>
        <div className="flex justify-between text-sm"><span className="text-gray-400 font-medium">Booking ID</span><span className="font-bold text-gray-800">BK976533</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-400 font-medium">Property</span><span className="font-bold text-gray-800">Modern 2BHK Apartment in Thamel</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-400 font-medium">Move-in Date</span><span className="font-bold text-gray-800">2024-04-05</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-400 font-medium">Duration</span><span className="font-bold text-gray-800">1 months</span></div>
        <div className="flex justify-between text-sm pt-4 border-t border-gray-200"><span className="text-gray-400 font-medium">Total Paid</span><span className="font-bold text-[#A989C8] text-lg">NPR 76,250</span></div>
      </div>

      <div className="flex gap-4 justify-center">
        <button onClick={onSignAgreement} className="px-10 py-4 bg-[#A989C8] text-white font-bold rounded-2xl flex items-center gap-2 transition hover:bg-[#9370DB] shadow-lg shadow-purple-100"><FileSignature size={18} /> Sign Agreement</button>
        <button className="px-10 py-4 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition flex items-center gap-2"><Download size={18} /> Download Invoice</button>
      </div>
    </div>
  );
}