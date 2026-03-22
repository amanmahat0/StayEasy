import { Home, Users, CheckCircle2 } from 'lucide-react';

const SolutionsGrid = () => {
  return (
    <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Property Solutions</h2>
          <p className="text-gray-500">Everything you need to find, manage, or rent out properties</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Landlords Card */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#A989C8] rounded-xl flex items-center justify-center text-white">
                <Home size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">For Landlords</h3>
            </div>
            <ul className="space-y-4">
              {[
                "List unlimited properties with photos and details",
                "Verify tenant identity through KYC process",
                "Collect rent securely through Khalti",
                "Create and manage digital rental agreements",
                "Track property performance and revenue"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <CheckCircle2 size={20} className="text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tenants Card */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                <Users size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">For Tenants</h3>
            </div>
            <ul className="space-y-4">
              {[
                "Browse thousands of verified properties",
                "Filter by location, price, and amenities",
                "Schedule property visits conveniently",
                "Make secure online payments",
                "Manage bookings from one dashboard"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600">
                  <CheckCircle2 size={20} className="text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsGrid;