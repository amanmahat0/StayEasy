import { useState } from "react";
import PublicNavbar from "../../Navbar/PublicNavbar";
import Confirmations from "./Conformations"; 
import Details from "./Details";
import Payment from "./Payment";
import Success from "./Success";

export default function Booking() {
  const [step, setStep] = useState<number>(1);

  // Helper to go back a step
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-inter pb-20">
      <PublicNavbar />
      <div className="max-w-[1200px] mx-auto pt-10 px-6">
        
        {/* Step Indicator - logic remains the same */}
        {/* We only show the stepper for the first 3 steps (Details, Payment, Success) */}
        {step <= 3 && (
          <div className="flex items-center justify-center mb-12">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? "bg-[#A989C8] text-white" : "bg-gray-200 text-gray-500"}`}>
                    {s}
                  </div>
                  <span className={`text-sm font-bold ${step >= s ? "text-gray-800" : "text-gray-400"}`}>
                    {s === 1 ? "Details" : s === 2 ? "Payment" : "Confirmation"}
                  </span>
                </div>
                {s < 3 && <div className="w-16 h-[2px] bg-gray-200 mx-4" />}
              </div>
            ))}
          </div>
        )}

        {/* Content Toggle */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Step 1: Details */}
          {step === 1 && (
            <Details 
              onNext={() => setStep(2)} 
              onBack={() => window.history.back()} // Goes back to the property page
            />
          )}
          
          {/* Step 2: Payment */}
          {step === 2 && (
            <Payment 
              onNext={() => setStep(3)} 
              onBack={handleBack} 
            />
          )}
          
          {/* Step 3: Success Screen */}
          {step === 3 && (
            <Success 
              onSignAgreement={() => setStep(4)} 
            />
          )}

          {/* Step 4: Digital Agreement */}
          {step === 4 && (
            <Confirmations 
              onBack={() => setStep(3)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}