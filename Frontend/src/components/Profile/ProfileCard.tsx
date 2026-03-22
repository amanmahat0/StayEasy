import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileCardProps {
  name: string;
}

export default function ProfileCard({ name }: ProfileCardProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 bg-primary rounded-xl p-4 w-64 text-white shadow-lg">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
          <User size={16} />
        </div>
        <div>
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs opacity-80">Verified Landlord</p>
        </div>
      </div>

      <button
        onClick={() => navigate("/profile")}
        className="w-full bg-white/20 py-2 rounded-md text-sm hover:bg-white/30 transition"
      >
        View Profile
      </button>
    </div>
  );
}
