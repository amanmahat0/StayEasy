import { ShieldCheck, Download, Smartphone, Mail, MousePointer2, ArrowLeft } from "lucide-react";

export default function Confirmations({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-bold text-sm mb-6 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        BACK
      </button>

      <h1 className="text-4xl font-black text-gray-900 text-center mb-2">Digital Rental Agreement</h1>
      <p className="text-gray-500 text-center mb-12 font-medium">Please review and sign the agreement to complete your booking</p>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-8 bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 bg-gray-50 border-b flex items-center gap-4">
             <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#A989C8]"><ShieldCheck size={20}/></div>
             <div><h4 className="font-bold text-gray-900">Rental Agreement</h4><p className="text-[10px] text-gray-400 font-bold">AG26021340</p></div>
          </div>
          <div className="p-10 overflow-y-auto text-sm leading-relaxed text-gray-600 space-y-6">
             <p className="font-bold text-gray-900 uppercase tracking-widest text-xs">Property Details</p>
             <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Property</p><p className="font-bold text-gray-800">Modern 2BHK Apartment in Thamel</p></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Location</p><p className="font-bold text-gray-800">Thamel, Kathmandu</p></div>
             </div>
             <p className="font-bold text-gray-900 uppercase tracking-widest text-xs">Rental Terms</p>
             <p>The Tenant agrees to pay a monthly rent of NPR 25,000. A security deposit of NPR 50,000 is held and refundable at the end of the lease term.</p>
             <p className="font-bold text-gray-900 uppercase tracking-widest text-xs">Tenant Obligations</p>
             <ul className="list-disc pl-5 space-y-2">
                <li>Pay rent on or before the due date</li>
                <li>Maintain the property in good condition</li>
                <li>No subleasing without landlord's consent</li>
             </ul>
          </div>
        </div>

        <div className="col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
             <h4 className="font-bold text-gray-900 mb-6">Sign Agreement</h4>
             <div className="space-y-3 mb-8">
                <button className="w-full p-4 rounded-2xl border-2 border-[#A989C8] bg-purple-50/30 flex items-center gap-3"><MousePointer2 size={18} className="text-[#A989C8]"/><span className="text-sm font-bold text-gray-800">Digital Signature</span></button>
                <button className="w-full p-4 rounded-2xl border border-gray-100 flex items-center gap-3"><Mail size={18} className="text-gray-400"/><span className="text-sm font-bold text-gray-500">Email OTP</span></button>
                <button className="w-full p-4 rounded-2xl border border-gray-100 flex items-center gap-3"><Smartphone size={18} className="text-gray-400"/><span className="text-sm font-bold text-gray-500">Phone OTP</span></button>
             </div>
             <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Type your full name</label>
             <input placeholder="sds" className="w-full p-4 bg-gray-50 rounded-xl italic font-serif text-xl mb-6 outline-none" />
             <button onClick={() => alert("Agreement Signed!")} className="w-full py-4 bg-[#A989C8] text-white font-bold rounded-2xl shadow-lg">Sign Agreement</button>
             <button className="w-full mt-3 py-4 border border-gray-200 text-gray-500 font-bold rounded-2xl flex items-center justify-center gap-2"><Download size={18}/> Download PDF</button>
          </div>
          <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex gap-4 items-start">
             <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
             <div><p className="text-xs font-bold text-emerald-800 mb-1">Legally Binding</p><p className="text-[10px] text-emerald-600 leading-normal">This digital agreement is legally valid and enforceable under Nepal's Electronic Transaction Act.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}