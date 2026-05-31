import { useEffect, useState } from "react";
import { CreditCard, CalendarCheck, Heart, RefreshCw, XCircle } from "lucide-react";
import { getRecentActivity } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface Activity {
  type: string;
  action: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  entity_type: string;
  entity_id: number;
}

const ICON_MAP: Record<string, any> = {
  CreditCard,
  CalendarCheck,
  Heart,
  RefreshCw,
  XCircle,
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function RecentActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getRecentActivity().then((data) => {
      setActivities(data);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="font-semibold mb-4">Recent Activity</h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A989C8]" />
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-3 text-sm">
          {activities.map((a, i) => {
            const Icon = ICON_MAP[a.icon] || CalendarCheck;
            const colorMap: Record<string, string> = {
              green: "text-green-500",
              blue: "text-blue-500",
              orange: "text-orange-500",
              red: "text-red-500",
            };
            return (
              <div key={`${a.type}-${a.entity_id}-${i}`} className="flex gap-3">
                <Icon className={colorMap[a.color] || "text-gray-500"} size={18} />
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.description}</p>
                  <p className="text-[10px] text-gray-400">{timeAgo(a.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
