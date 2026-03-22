import { useRef } from "react";
import { Camera, Check } from "lucide-react";
import { KYCFooter } from "./KYCFooter";

export default function KYCStep3() {
  const selfieRef = useRef<HTMLInputElement>(null);

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log("Selfie:", file);
  };

  return (
    <div className="space-y-6">
      {/* Selfie Upload */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Upload Selfie <span className="text-red-500">*</span>
        </label>

        <div
          onClick={() => selfieRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-[#F2E9FF] hover:border-[#A87DC2] transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Camera className="text-gray-400 group-hover:text-[#A87DC2]" size={32} />
          </div>

          <p className="font-bold text-gray-700 mb-1 text-lg">Take a Selfie</p>
          <p className="text-sm text-gray-400 mb-4">Click to open camera or upload photo</p>

          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#F2E9FF]/50 text-[#A87DC2] rounded-full text-xs font-semibold">
            <Check size={14} />
            Make sure your face is clearly visible
          </div>
        </div>

        <input
          ref={selfieRef}
          type="file"
          hidden
          accept="image/*"
          onChange={handleSelfieUpload}
        />
      </div>

      {/* Guidelines */}
      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
        <h4 className="font-bold text-gray-800 mb-4">Selfie Guidelines:</h4>
        <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
          <li>Face the camera directly with neutral expression</li>
          <li>Remove sunglasses, hats, or face coverings</li>
          <li>Ensure good lighting with no shadows on face</li>
          <li>Photo should match your ID document photo</li>
        </ul>
      </div>

      <KYCFooter />
    </div>
  );
}
