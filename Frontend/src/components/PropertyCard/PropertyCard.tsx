import { MapPin, Bed, Bath, Star, MoreVertical } from 'lucide-react';

interface PropertyProps {
  property: {
    title: string;
    city: string;
    bedrooms: string;
    bathrooms: string;
    monthlyRent: string;
    images: string[]; // URLs from your backend
    propertyType: string;
  };
}

const PropertyCard = ({ property }: PropertyProps) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-5 hover:shadow-md transition-shadow group relative">
      {/* Property Image */}
      <div className="w-40 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <img 
          src={property.images[0] || 'https://via.placeholder.com/400x300'} 
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Property Details */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{property.title}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
              <MapPin size={14} />
              <span>{property.city}, Nepal</span>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4 mt-3 text-gray-600 text-sm">
          <div className="flex items-center gap-1.5">
            <Bed size={16} className="text-[#A989C8]" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath size={16} className="text-[#A989C8]" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="font-medium text-gray-900">New</span>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-[#A989C8] font-bold text-lg">
            NPR {property.monthlyRent}<span className="text-xs text-gray-400 font-normal">/month</span>
          </div>
          <button className="bg-[#A989C8]/10 text-[#A989C8] px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#A989C8] hover:text-white transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;