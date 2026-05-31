import React from 'react';
import { Check } from 'lucide-react';

interface Props {
  currentStep: number;
}

const Stepper: React.FC<Props> = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Property Type" },
    { id: 2, label: "Basic Info" },
    { id: 3, label: "Details" },
    { id: 4, label: "Pricing" },
    { id: 5, label: "Images" },
  ];

  return (
    <div className="flex items-center justify-between px-2 md:px-10">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center z-10">
              <div 
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all duration-300 border-2
                  ${isCompleted 
                    ? 'bg-[#A87DC2] border-[#A87DC2] text-white' 
                    : isActive 
                      ? 'bg-[#A87DC2] border-[#A87DC2] text-white shadow-lg shadow-[#A87DC2]/40' 
                      : 'bg-white border-gray-200 text-gray-500' 
                  }`}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
              </div>
              <span className={`text-xs font-semibold tracking-wide ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>

            {index !== steps.length - 1 && (
              <div className="flex-1 h-[2px] bg-gray-100 mx-4 -mt-6 relative">
                 <div 
                    className="absolute top-0 left-0 h-full bg-[#A87DC2] transition-all duration-500"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                 />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;