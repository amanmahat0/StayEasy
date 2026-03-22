import { Target, Shield, Eye } from 'lucide-react';

const MissionVision = () => {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Mission */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center hover:bg-white hover:shadow-lg transition-all border border-gray-100">
          <div className="w-14 h-14 bg-[#A989C8] rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-md shadow-[#A989C8]/30">
            <Target size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            To revolutionize property rental in Nepal through technology, making it easy, secure, and transparent for everyone.
          </p>
        </div>

        {/* Values */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center hover:bg-white hover:shadow-lg transition-all border border-gray-100">
          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-md shadow-blue-500/30">
            <Shield size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Our Values</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Trust, transparency, innovation, and customer satisfaction guide every decision we make.
          </p>
        </div>

        {/* Vision */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center hover:bg-white hover:shadow-lg transition-all border border-gray-100">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-md shadow-green-500/30">
            <Eye size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            To become Nepal's most trusted property rental platform, helping thousands find their perfect home.
          </p>
        </div>

      </div>
    </section>
  );
};

export default MissionVision;