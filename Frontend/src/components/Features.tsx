import React from 'react';
import { ShieldCheck, FileText, Clock, Star } from 'lucide-react';

interface FeatureItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const features: FeatureItem[] = [
  {
    id: 1,
    title: 'Verified Landlords',
    description: 'All property owners undergo thorough verification',
    icon: <ShieldCheck size={24} />,
    iconBg: 'bg-[#E8F5E9]', // Soft green
    iconColor: 'text-[#2E7D32]',
  },
  {
    id: 2,
    title: 'Digital Agreements',
    description: 'Secure, legally-binding digital contracts',
    icon: <FileText size={24} />,
    iconBg: 'bg-[#F3E5F5]', // Soft purple
    iconColor: 'text-[#7B1FA2]',
  },
  {
    id: 3,
    title: 'Instant Booking',
    description: 'Book your space in minutes, not days',
    icon: <Clock size={24} />,
    iconBg: 'bg-[#E3F2FD]', // Soft blue
    iconColor: 'text-[#1976D2]',
  },
  {
    id: 4,
    title: 'Trusted Reviews',
    description: 'Real reviews from verified tenants',
    icon: <Star size={24} />,
    iconBg: 'bg-[#FFF8E1]', // Soft amber
    iconColor: 'text-[#FFA000]',
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Part */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-[#1A1D2E] mb-4">
            Why Choose StayEasy?
          </h2>
          <p className="text-gray-600 text-lg">
            Trusted by thousands across Nepal
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-10 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 text-center flex flex-col items-center"
            >
              {/* Icon Container */}
              <div className={`${item.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                <div className={item.iconColor}>
                  {item.icon}
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#1A1D2E] mb-3">
                {item.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
