import { useState } from "react";
import { Lock, ArrowLeft } from "lucide-react";

export default function Payment({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  // 1. Logic preserved exactly from your previous version
  const [selectedMethod, setSelectedMethod] = useState<"full" | "partial">("full");

  const rent = 25000;
  const deposit = 50000;
  const serviceFee = 1250;
  const total = rent + deposit + serviceFee; // 76250

  const payingNow = selectedMethod === "full" ? total : 51250; 
  const remaining = total - payingNow;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Back Button positioned above the payment details */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-bold text-sm mb-6 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        BACK
      </button>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left Column: Payment Form */}
        <div className="col-span-8 bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900 mb-8">Payment Method</h2>
          
          <div className="space-y-4 mb-10">
            {/* Pay Full Amount */}
            <div 
              onClick={() => setSelectedMethod("full")}
              className={`p-6 border-2 rounded-3xl flex justify-between items-center cursor-pointer transition-all ${
                selectedMethod === "full" ? "border-[#A989C8] bg-purple-50/10" : "border-gray-100 opacity-50"
              }`}
            >
              <div>
                <p className="font-bold text-gray-800">Pay Full Amount</p>
                <p className="text-xs text-gray-400 font-medium">Pay NPR {total.toLocaleString()} now</p>
              </div>
            </div>

            {/* Partial Payment */}
            <div 
              onClick={() => setSelectedMethod("partial")}
              className={`p-6 border-2 rounded-3xl flex justify-between items-center cursor-pointer transition-all ${
                selectedMethod === "partial" ? "border-[#A989C8] bg-purple-50/10" : "border-gray-100 opacity-50"
              }`}
            >
              <div>
                <p className="font-bold text-gray-800">Partial Payment</p>
                <p className="text-xs text-gray-400 font-medium">Pay NPR 51,250 now (deposit + fee)</p>
              </div>
            </div>
          </div>

          {/* Khalti Integration */}
          <div className="p-8 border border-gray-100 rounded-[32px] space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#5C2D91] rounded-xl flex items-center justify-center text-white font-black italic text-xl">K</div>
              <div>
                <h4 className="font-bold text-gray-900">Secure Payment with Khalti</h4>
                <p className="text-xs text-gray-400 font-medium tracking-wide">Safe and encrypted payment gateway</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Khalti ID / Mobile Number</label>
                <input placeholder="98XXXXXXXX" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#A989C8] transition-colors" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PIN</label>
                <input type="password" placeholder="Enter your Khalti PIN" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[#A989C8] transition-colors" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-2">
              <Lock size={12} /> Your payment information is encrypted and secure
            </div>
          </div>

          <button onClick={onNext} className="w-full mt-10 py-5 bg-[#A989C8] hover:bg-[#9677b4] text-white font-black rounded-2xl shadow-xl shadow-purple-100 transition-all text-lg">
            Confirm Payment - NPR {payingNow.toLocaleString()}
          </button>
        </div>

        {/* Right Column: Payment Summary */}
        <div className="col-span-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm sticky top-10">
          <h3 className="font-bold text-gray-900 mb-6 text-lg">Payment Summary</h3>
          
          <div className="space-y-4 text-sm pb-6 border-b border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Rent</span>
              <span className="font-bold text-gray-800">NPR {rent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Security Deposit</span>
              <span className="font-bold text-gray-800">NPR {deposit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-medium">Service Fee</span>
              <span className="font-bold text-gray-800">NPR {serviceFee.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-gray-800">Total</span>
              <span className="text-xl font-black text-[#A989C8]">NPR {total.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Paying now</span>
              <span className="text-sm font-black text-emerald-500">NPR {payingNow.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Remaining</span>
              <span className={`text-sm font-black ${remaining > 0 ? "text-orange-400" : "text-gray-300"}`}>
                NPR {remaining.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}