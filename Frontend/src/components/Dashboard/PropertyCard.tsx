import { MapPin, Star, Heart } from "lucide-react";

interface PropertyCardProps {
  image: string;
  title: string;
  location: string;
  beds: number | string;
  baths: number | string;
  price: string;
  rating: number | string;
}

export default function PropertyCard({
  image,
  title,
  location,
  beds,
  baths,
  price,
  rating,
}: PropertyCardProps) {
  return (
    <div className="flex gap-4 border rounded-xl p-4">
      <img
        src={image}
        alt={title}
        className="w-24 h-20 rounded-lg object-cover"
      />

      <div className="flex-1">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin size={12} /> {location}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {beds} Beds · {baths} Baths ·
          <span className="text-yellow-500 ml-1 flex items-center gap-1 inline-flex">
            <Star size={12} /> {rating}
          </span>
        </p>

        <p className="text-sm font-medium text-primary mt-1">
          {price}/month
        </p>
      </div>

      <div className="flex flex-col justify-between items-end">
        <Heart size={16} className="text-gray-400" />
        <button className="text-xs bg-primary text-white px-3 py-1 rounded-md">
          View Details
        </button>
      </div>
    </div>
  );
}
