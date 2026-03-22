import React from 'react';
import { Home, Building2, Map, ArrowRight } from 'lucide-react';

// Define the shape of your data
interface Category {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const categoryData: Category[] = [
  {
    id: 1,
    title: 'Rooms',
    description: 'Find affordable single and shared rooms.',
    icon: <Home size={28} />
  },
  {
    id: 2,
    title: 'Flats',
    description: 'Modern and luxury penthouses.',
    icon: <Building2 size={28} />
  },
  {
    id: 3,
    title: 'Land',
    description: 'Commercial and agricultural plots.',
    icon: <Map size={28} />
  }
];

const Categories: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1A1D2E] mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Whether you're looking for a cozy room or a vast piece of land, we have the perfect verified listing for you.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryData.map((category) => (
            <div 
              key={category.id} 
              className="group p-8 rounded-[32px] border border-gray-100 bg-[#FBFAFF] hover:bg-white hover:shadow-2xl hover:shadow-[#A989C8]/20 transition-all duration-500 cursor-pointer"
            >
              {/* Icon Container */}
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 group-hover:bg-[#A989C8] group-hover:text-white transition-all duration-500 text-[#A989C8]">
                {category.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-2xl font-bold text-[#1A1D2E] mb-3">
                {category.title}
              </h3>
              <p className="text-gray-500 leading-relaxed mb-8">
                {category.description}
              </p>

              {/* Bottom Details (Arrow Only) */}
              <div className="flex items-center justify-end pt-6">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#A989C8]/10 group-hover:text-[#A989C8] transition-colors duration-300">
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
