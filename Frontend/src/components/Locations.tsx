import React from 'react';

interface City {
  id: number;
  name: string;
  count: string;
  image: string;
}

const cities: City[] = [
  { 
    id: 1, 
    name: 'Thamel', 
    count: '45 properties', 
    image: 'https://images.unsplash.com/photo-1745165420599-5af12543ac45?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
  },
  { 
    id: 2, 
    name: 'Patan', 
    count: '38 properties', 
    image: 'https://images.unsplash.com/photo-1609898793184-7d1496532e84?q=80&w=2585&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
  },
  { 
    id: 3, 
    name: 'Bhaktapur', 
    count: '22 properties', 
    image: 'https://images.unsplash.com/photo-1650731657583-c97ae3e9916b?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
  },
  { 
    id: 4, 
    name: 'Pokhara', 
    count: '31 properties', 
    image: 'https://images.unsplash.com/photo-1562462181-b228e3cff9ad?q=80&w=1910&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
  },
];

const Locations: React.FC = () => {
  return (
    <section className="py-24 bg-white w-full">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header - Centered exactly like the pic */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-[#1A1D2E] mb-4">
            Explore Popular Locations
          </h2>
          <p className="text-gray-500 text-lg">
            Find properties in Nepal's most sought-after areas
          </p>
        </div>

        {/* The Grid - No outer boxes, just the image cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <div 
              key={city.id} 
              className="group relative h-[280px] rounded-[32px] overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <img 
                src={city.image} 
                alt={city.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />

              {/* Dark Gradient Overlay - Only at the bottom for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-8">
                <h4 className="text-white font-bold text-2xl mb-1 transition-transform duration-300 group-hover:-translate-y-1">
                  {city.name}
                </h4>
                <p className="text-white/70 text-sm font-medium">
                  {city.count}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Locations;