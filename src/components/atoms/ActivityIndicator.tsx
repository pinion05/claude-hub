import React from 'react';

export interface ActivityIndicatorProps {
  level?: 'very-active' | 'active' | 'moderate' | 'low' | 'inactive';
  commitsLastMonth?: number;
  commitsLastWeek?: number;
  showDetails?: boolean;
  className?: string;
}

export const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({
  level = 'inactive',
  commitsLastMonth,
  commitsLastWeek,
  showDetails = false,
  className = '',
}) => {
  const levelConfig = {
    'very-active': {
      label: 'Very Active',
      color: 'bg-green-500',
      pulseColor: 'bg-green-400',
      textColor: 'text-green-400',
      bars: 5,
      activeBars: 5,
    },
    'active': {
      label: 'Active',
      color: 'bg-emerald-500',
      pulseColor: 'bg-emerald-400',
      textColor: 'text-emerald-400',
      bars: 5,
      activeBars: 4,
    },
    'moderate': {
      label: 'Moderate',
      color: 'bg-yellow-500',
      pulseColor: 'bg-yellow-400',
      textColor: 'text-yellow-400',
      bars: 5,
      activeBars: 3,
    },
    'low': {
      label: 'Low Activity',
      color: 'bg-orange-500',
      pulseColor: 'bg-orange-400',
      textColor: 'text-orange-400',
      bars: 5,
      activeBars: 2,
    },
    'inactive': {
      label: 'Inactive',
      color: 'bg-gray-500',
      pulseColor: 'bg-gray-400',
      textColor: 'text-gray-400',
      bars: 5,
      activeBars: 1,
    },
  };

  const config = levelConfig[level];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Activity Bars */}
      <div className="flex items-end gap-0.5">
        {Array.from({ length: config.bars }, (_, index) => {
          const isActive = index < config.activeBars;
          const height = `${(index + 1) * 3 + 4}px`;
          
          return (
            <div
              key={index}
              className={`w-1 transition-all duration-300 rounded-sm ${
                isActive ? config.color : 'bg-gray-700'
              }`}
              style={{ height }}
              title={`Activity level: ${config.label}`}
            />
          );
        })}
      </div>

      {/* Pulse Indicator for Very Active projects */}
      {level === 'very-active' && (
        <div className="relative">
          <div
            className={`absolute inset-0 ${config.pulseColor} rounded-full animate-ping opacity-75`}
          />
          <div className={`w-2 h-2 ${config.color} rounded-full`} />
        </div>
      )}

      {/* Details */}
      {showDetails && (
        <div className="flex flex-col">
          <span className={`text-xs font-medium ${config.textColor}`}>
            {config.label}
          </span>
          {(commitsLastMonth !== undefined || commitsLastWeek !== undefined) && (
            <span className="text-xs text-gray-500">
              {commitsLastWeek !== undefined && `${commitsLastWeek} this week`}
              {commitsLastWeek !== undefined && commitsLastMonth !== undefined && ' · '}
              {commitsLastMonth !== undefined && `${commitsLastMonth} this month`}
            </span>
          )}
        </div>
      )}
    </div>
  );
};