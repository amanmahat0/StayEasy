import { useState } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Component Imports
import Stepper from '../../components/AddProperty/Stepper';
import Step1Type from '../../components/AddProperty/Step1Type';
import Step2BasicInfo from '../../components/AddProperty/Step2BasicInfo';
import Step3Details from '../../components/AddProperty/Step3Details';
import Step4Pricing from '../../components/AddProperty/Step4Pricing';
import Step5Images from '../../components/AddProperty/Step5Images';

// Define TypeScript type for formData
type FormDataType = {
  propertyType: string;
  title: string;
  description: string;
  province: string;
  district: string;
  city: string;
  area: string;
  fullAddress: string;
  bedrooms: string;
  bathrooms: string;
  areaSize: string;
  floorNumber: string;
  totalFloors: string;
  furnishing: string;
  amenities: string[];        // Array of strings
  availableFrom: string;
  leasePeriod: string;
  monthlyRent: string;
  securityDeposit: string;
  maintenanceFee: string;
  images: File[];             // Only File[]
};

const AddProperty = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState<FormDataType>({
    propertyType: 'apartment',
    title: '', description: '', province: '', district: '', city: '', area: '', fullAddress: '',
    bedrooms: '', bathrooms: '', areaSize: '', floorNumber: '', totalFloors: '', furnishing: '',
    amenities: [], availableFrom: '', leasePeriod: '',
    monthlyRent: '', securityDeposit: '', maintenanceFee: '',
    images: []   // File[]
  });

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // -----------------------------
  // FULL SUBMIT HANDLER (TYPE SAFE)
  // -----------------------------
  const handleSubmit = async () => {
    const token = localStorage.getItem('access'); // JWT from storage (correct key)
    
    if (!token) {
      alert('You must be logged in to add a property');
      navigate('/login');
      return;
    }

    const formPayload = new FormData();

    // Map form fields to Django model fields
    formPayload.append('property_type', formData.propertyType);
    formPayload.append('title', formData.title);
    formPayload.append('description', formData.description);
    formPayload.append('address', formData.fullAddress || `${formData.city}, ${formData.district}`);
    formPayload.append('city', formData.city);
    formPayload.append('price', formData.monthlyRent);

    // Append all image files
    formData.images.forEach((file: File) => {
      formPayload.append('images', file);
    });

    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/property/add/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server error:', data);
        alert('Failed to add property: ' + JSON.stringify(data.error || data));
        return;
      }

      alert('Property added successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Request error:', err);
      alert('An error occurred. Check console for details.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Type formData={formData} setFormData={setFormData} />;
      case 2: return <Step2BasicInfo formData={formData} setFormData={setFormData} />;
      case 3: return <Step3Details formData={formData} setFormData={setFormData} />;
      case 4: return <Step4Pricing formData={formData} setFormData={setFormData} />;
      case 5: return <Step5Images formData={formData} setFormData={setFormData} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      {/* 1. Navigation Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
            <div className="bg-[#A87DC2] p-1.5 rounded-lg text-white">
              <Home size={20} />
            </div>
            StayEasy
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 2. Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Property</h1>
          <p className="text-gray-500">List your property and reach thousands of verified tenants</p>
        </div>

        {/* 3. Stepper Progress Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <Stepper currentStep={currentStep} />
        </div>

        {/* 4. Main Form Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 min-h-[400px]">
          {renderStep()}
        </div>

        {/* 5. Footer Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-8 py-3 rounded-xl font-semibold text-sm transition-colors ${
              currentStep === 1 
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>
          
          <button
            onClick={currentStep === 5 ? handleSubmit : handleNext}
            className={`px-8 py-3 text-white rounded-xl font-semibold text-sm shadow-md transition-all transform active:scale-95
              bg-[#A87DC2] hover:opacity-90 shadow-[#A87DC2]/30`}
          >
            {currentStep === 5 ? 'Submit Property' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;