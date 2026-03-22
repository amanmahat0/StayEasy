import { useState } from "react";
import { useNavigate } from "react-router-dom";
import KYCStep1 from "./KYCStep1";
import KYCStep2 from "./KYCStep2";
import KYCStep3 from "./KYCStep3";

function KYCProgress({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
          <div
            className="h-2 bg-[#A87DC2] transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <span className="text-sm text-[#A87DC2]">
          {Math.round((step / 3) * 100)}% Complete
        </span>
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span className={step >= 1 ? "text-[#A87DC2]" : ""}>Personal Info</span>
        <span className={step >= 2 ? "text-[#A87DC2]" : ""}>ID Verification</span>
        <span className={step >= 3 ? "text-[#A87DC2]" : ""}>Selfie</span>
      </div>
    </div>
  );
}

export default function KYCContainer() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  /* 🔹 STEP NAVIGATION */
  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  /* 🔹 SAVE & EXIT */
  const saveAndExit = () => {
    // later: send draft data to backend
    navigate("/dashboard");
  };

  /* 🔹 FINAL SUBMIT */
  const handleSubmit = () => {
    // later: send full KYC data to Django
    console.log("KYC Submitted");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-xl">
        <KYCProgress step={step} />

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          {step === 1 && <KYCStep1 />}
          {step === 2 && <KYCStep2 />}
          {step === 3 && <KYCStep3 />}

          {/* 🔘 BUTTONS */}
          <div className="flex justify-between mt-6">
            {/* BACK */}
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-2 rounded-xl border text-gray-600 disabled:opacity-50"
            >
              Back
            </button>

            <div className="flex space-x-2">
              {/* SAVE & CONTINUE LATER */}
              <button
                onClick={saveAndExit}
                className="px-6 py-2 rounded-xl border bg-white text-gray-600 hover:bg-gray-100"
              >
                Save & Continue Later
              </button>

              {/* CONTINUE / SUBMIT */}
              <button
                onClick={nextStep}
                className="px-6 py-2 rounded-xl bg-[#A87DC2] text-white hover:bg-[#8A64B2]"
              >
                {step === 3 ? "Submit" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
