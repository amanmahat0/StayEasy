import React from 'react';
import { Building2 } from 'lucide-react';

const CTA: React.FC = () => {
  return (
    <section className="w-full bg-gradient-to-r from-[#9b72b8] to-[#b48bd6] py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
          Ready to List Your Property?
        </h2>

        {/* Description */}
        <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-12 max-w-3xl mx-auto">
          Join thousands of landlords who trust StayEasy to manage their rentals.
          Get verified tenants and secure payments with zero hassle.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          
          {/* Primary */}
          <button className="flex items-center gap-2 bg-white text-[#9b72b8] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl active:scale-95">
            <Building2 size={22} />
            List Your Property
          </button>

          {/* Secondary */}
          <button className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/15 transition-all active:scale-95">
            Browse Properties
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
