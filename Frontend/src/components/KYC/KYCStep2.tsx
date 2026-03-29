import { useRef, useState } from "react";
import { Shield, CreditCard, FileText, Upload, Info } from "lucide-react";
import { KYCFooter } from "./KYCFooter";
import type { KYCFormData } from "./KYCContainer";

type IDType = "citizenship" | "passport" | "license";

interface IDTypeCardProps {
  id: IDType;
  label: string;
  icon: typeof FileText;
  active: boolean;
  onClick: (id: IDType) => void;
}

function IDTypeCard({ id, label, icon: Icon, active, onClick }: IDTypeCardProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`p-4 rounded-xl border-2 transition-all ${
        active
          ? "border-[#A87DC2] bg-[#F2E9FF]"
          : "border-gray-200 bg-white hover:border-[#A87DC2]/30"
      }`}
    >
      <Icon className="w-6 h-6 mx-auto mb-2" />
      <p className="text-sm font-semibold text-gray-700">{label}</p>
    </button>
  );
}

interface KYCStep2Props {
  formData: KYCFormData;
  onUpdate: (data: Partial<KYCFormData>) => void;
}

export default function KYCStep2({ formData, onUpdate }: KYCStep2Props) {
  const [selectedID, setSelectedID] = useState<IDType>("citizenship");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate({ document_image: file });
    }
  };

  return (
    <div className="space-y-6">
      {/* ID Type Selection */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Select ID Type <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <IDTypeCard
            id="citizenship"
            label="Citizenship"
            icon={FileText}
            active={selectedID === "citizenship"}
            onClick={setSelectedID}
          />
          <IDTypeCard
            id="passport"
            label="Passport"
            icon={CreditCard}
            active={selectedID === "passport"}
            onClick={setSelectedID}
          />
          <IDTypeCard
            id="license"
            label="Driving License"
            icon={Shield}
            active={selectedID === "license"}
            onClick={setSelectedID}
          />
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
          value={formData.citizenship_number}
          onChange={(e) => onUpdate({ citizenship_number: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A87DC2]/20 focus:border-[#A87DC2]"
        />
      </div>

      {/* Upload Document */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Upload ID Document <span className="text-red-500">*</span>
        </label>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-[#F2E9FF] hover:border-[#A87DC2] transition-all cursor-pointer"
        >
          <Upload className="text-gray-400 w-8 h-8 mb-2" />
          <p className="font-bold text-gray-700">
            {formData.document_image
              ? `Selected: ${formData.document_image.name}`
              : "Upload ID Document"}
          </p>
          <p className="text-sm text-gray-400">PNG, JPG, PDF up to 10MB</p>
        </div>

        <input
          ref={fileRef}
          type="file"
          hidden
          accept="image/*,.pdf"
          onChange={handleDocumentUpload}
        />
      </div>

      {/* Info Note */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start">
        <Info className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-amber-700">
          Document must be clear, readable, and match your personal information exactly.
        </p>
      </div>

      <KYCFooter />
    </div>
  );
}
