
const OurStory = () => {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Text */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Why StayEasy</h2>
          
          <div className="text-gray-600 space-y-4 leading-relaxed text-justify">
            <p>
              StayEasy is a technology-powered real estate startup founded with the hope of serving the home seekers, dreamers and sellers. With the passion to empower the consumers and simplify the real estate scenario, StayEasy focuses on providing solutions and professional guidance with the combination of technology, digital presence and experienced field agents and brokers.
            </p>
            <p>
              StayEasy being a comprehensive competing national site, is a digital platform having a wide spectrum of visual community catering unparalleled services with conceivable property listings and their details. With the knowledge of real estate setting, StayEasy aims to continuously explore new ideas and technology to make property search easier and faster, as well as bringing home owners and home professionals together.
            </p>
          </div>
        </div>

        {/* Right Image - Lalitpur (Patan Durbar Square) */}
        <div className="rounded-2xl overflow-hidden shadow-lg h-[350px] relative group">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-500"></div>
          <img 
            src="https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1000&auto=format&fit=crop" 
            alt="Lalitpur Patan Durbar Square" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Optional: Label tag */}
          <div className="absolute bottom-4 left-4">
             <span className="bg-white/90 backdrop-blur-md text-xs font-bold px-3 py-1 rounded-full text-gray-800 shadow-sm">
                
             </span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default OurStory;