import { useRef, useState } from "react";
import { Shield, CreditCard, FileText, Upload, Info } from "lucide-react";
import { KYCFooter } from "./KYCFooter";

type IDType = "citizenship" | "passport" | "license";

export default function KYCStep2() {
  const [selectedID, setSelectedID] = useState<IDType>("citizenship");

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log("ID Front:", file);
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log("ID Back:", file);
  };

  return (
    <div className="space-y-6">
      {/* ID Type Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Select ID Type <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <IDTypeCard id="citizenship" label="Citizenship" icon={FileText} active={selectedID === "citizenship"} onClick={setSelectedID} />
          <IDTypeCard id="passport" label="Passport" icon={CreditCard} active={selectedID === "passport"} onClick={setSelectedID} />
          <IDTypeCard id="license" label="Driving License" icon={Shield} active={selectedID === "license"} onClick={setSelectedID} />
        </div>
      </div>

      {/* ID Number */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          ID Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Enter your ID number"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A87DC2]/20 focus:border-[#A87DC2]"
        />
      </div>

      {/* Upload ID Front */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Upload ID Front <span className="text-red-500">*</span>
        </label>

        <div
          onClick={() => frontRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-[#F2E9FF] hover:border-[#A87DC2] transition-all cursor-pointer"
        >
          <Upload className="text-gray-400 w-8 h-8 mb-2" />
          <p className="font-bold text-gray-700">Upload ID Front</p>
          <p className="text-sm text-gray-400">PNG, JPG, PDF up to 10MB</p>
        </div>

        <input
          ref={frontRef}
          type="file"
          hidden
          accept="image/*,.pdf"
          onChange={handleFrontUpload}
        />
      </div>

      {/* Upload ID Back */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Upload ID Back <span className="text-red-500">*</span>
        </label>

        <div
          onClick={() => backRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-[#F2E9FF] hover:border-[#A87DC2] transition-all cursor-pointer"
        >
          <Upload className="text-gray-400 w-8 h-8 mb-2" />
          <p className="font-bold text-gray-700">Upload ID Back</p>
          <p className="text-sm text-gray-400">PNG, JPG, PDF up to 10MB</p>
        </div>

        <input
          ref={backRef}
          type="file"
          hidden
          accept="image/*,.pdf"
          onChange={handleBackUpload}
        />
      </div>

      {/* Info Note */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start">
        <Info className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-amber-700 leading-relaxed">
          Ensure the document is clear, all corners are visible, and there is no glare.
        </p>
      </div>

      <KYCFooter />
    </div>
  );
}

function IDTypeCard({
  id,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  id: IDType;
  label: string;
  icon: any;
  active: boolean;
  onClick: (id: IDType) => void;
}) {
  return (
    <div
      onClick={() => onClick(id)}
      className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
        active
          ? "border-[#A87DC2] bg-[#F2E9FF] text-[#A87DC2]"
          : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
      }`}
    >
      <Icon size={32} strokeWidth={active ? 2.5 : 2} />
      <span className={`font-bold text-sm ${active ? "text-[#A87DC2]" : "text-gray-500"}`}>
        {label}
      </span>
    </div>
  );
}
