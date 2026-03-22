import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar/PublicNavbar";
import PropertiesHeader from "../../components/Properties/PropertiesHeader";
import PropertyFilters from "../../components/Properties/PropertyFilters";

const Properties = () => {
  const [activeTab, setActiveTab] = useState("available");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFBFD] font-sans pb-20">
      <Navbar />

      {/* Main Content */}
      <div className="relative">
        {/* Decorative gradient background */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#A989C8]/5 to-transparent -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Page Header */}
          <PropertiesHeader />

          {/* Filters */}
          <PropertyFilters activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Empty State */}
          <div className="lg:col-span-2 bg-white rounded-2xl border p-10 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-20 h-20 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6">
              <Plus size={28} className="text-[#A989C8]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No Properties Listed Yet
            </h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6 text-center leading-relaxed">
              Start building your rental portfolio by adding your first property. It only takes a few minutes!
            </p>
            <button
              onClick={() => navigate("/add-property")}
              className="flex items-center gap-2 bg-[#A989C8] hover:bg-[#9b7bb8] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-[#A989C8]/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add Your First Property
            </button>
          </div>

          {/* Later you can replace above with your dynamic properties list */}
          {/* {properties.length > 0 ? <PropertiesList /> : <EmptyPropertyState />} */}
        </div>
      </div>
    </div>
  );
};

export default Properties;
