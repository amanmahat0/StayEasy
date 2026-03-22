import React, { type ReactNode } from 'react';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: ReactNode;
  trendValue: string;
  trendColorClass: string;
  bgClass: string;
  borderClass: string;
  iconBgClass: string;
  iconColorClass: string;
  linkText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, subtext, icon, trendValue, trendColorClass, 
  bgClass, borderClass, iconBgClass, iconColorClass, linkText
}) => {
  return (
    <div className={`${bgClass} rounded-2xl p-6 border ${borderClass}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`${iconBgClass} p-2 rounded-lg ${iconColorClass}`}>
          {icon}
        </div>
        <span className={`${trendColorClass} text-xs font-bold flex items-center gap-1`}>
          <TrendingUp size={12} /> {trendValue}
        </span>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-1">{value}</h2>
      <p className="text-sm text-gray-600 mb-4">{title}</p>
      {linkText ? (
        <a href="#" className={`${iconColorClass} text-sm font-medium hover:underline`}>{linkText}</a>
      ) : (
        <p className="text-xs text-gray-500">{subtext}</p>
      )}
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, iconBgClass, iconColorClass }) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`${iconBgClass} p-3 rounded-xl ${iconColorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <h4 className="text-xl font-bold text-gray-900">{value}</h4>
      </div>
    </div>
  );
};