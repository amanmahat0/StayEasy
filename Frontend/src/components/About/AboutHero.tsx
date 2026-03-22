
const AboutHero = () => {
  return (
    <div className="relative py-24 px-6 text-center text-white overflow-hidden flex items-center justify-center min-h-[400px]">
      
      {/* 1. Background Image (Himalayas) */}
      <div className="absolute inset-0 z-0">
        <img 
          // 👇 REPLACE THIS LINK with your local image or the direct link to your Pinterest image
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2671&auto=format&fit=crop" 
          alt="Himalayas Nepal" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* 2. Purple Overlay (The Fade Effect) */}
      {/* We use your brand color #A989C8 with 85% opacity to create the purple tint */}
      <div className="absolute inset-0 bg-[#A989C8]/85 z-10 mix-blend-multiply"></div>
      <div className="absolute inset-0 bg-black/20 z-10"></div> {/* Slight dark tint for text readability */}

      {/* 3. Content */}
      <div className="relative z-20 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight drop-shadow-sm">
          About StayEasy
        </h1>
        <p className="text-lg md:text-xl font-medium opacity-95 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
          Real Estate in Nepal. Search thousands of rooms, flats, and land with StayEasy. Buy, Sell, Rent Properties in Nepal.
        </p>
      </div>
      
      {/* Optional: Bottom Mountain Shape Divider */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 md:h-24 bg-white z-20" 
        style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 40%, 0 100%)' }}
      ></div>
    </div>
  );
};

export default AboutHero;