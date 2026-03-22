import { CreditCard, CalendarCheck, Heart } from "lucide-react";

export default function RecentActivity() {
  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="font-semibold mb-4">Recent Activity</h3>

      <div className="space-y-4 text-sm">
        <div className="flex gap-3">
          <CreditCard className="text-green-500" size={18} />
          <div>
            <p className="font-medium">Payment Received</p>
            <p className="text-xs text-gray-500">2 hours ago</p>
          </div>
        </div>

        <div className="flex gap-3">
          <CalendarCheck className="text-blue-500" size={18} />
          <div>
            <p className="font-medium">New Booking Request</p>
            <p className="text-xs text-gray-500">5 hours ago</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Heart className="text-orange-500" size={18} />
          <div>
            <p className="font-medium">Property Saved</p>
            <p className="text-xs text-gray-500">1 day ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
