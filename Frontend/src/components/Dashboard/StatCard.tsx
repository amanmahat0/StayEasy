import React from "react";

interface StatCardProps {
  icon: React.ComponentType<{ size?: number }>; // ✅ size prop allowed
  label: string;
  value: string | number;
}

export default function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="w-9 h-9 bg-primary/20 text-primary rounded-lg flex items-center justify-center mb-3">
        <Icon size={18} />
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <h3 className="text-xl font-semibold mt-1">{value}</h3>
    </div>
  );
}
