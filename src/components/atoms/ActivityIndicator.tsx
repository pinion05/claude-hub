'use client';

import React from 'react';

interface ActivityIndicatorProps {
  level?: 'very-active' | 'active' | 'moderate' | 'low' | 'inactive';
  commitsLastMonth?: number | undefined;
  commitsLastWeek?: number | undefined;
  showDetails?: boolean;
  className?: string;
}

export function ActivityIndicator({
  level = 'inactive',
  commitsLastMonth,
  commitsLastWeek,
  showDetails = false,
  className = ''
}: ActivityIndicatorProps) {
  const getBarColor = (barIndex: number): string => {
    const levelMap = {
      'very-active': 5,
      'active': 4,
      'moderate': 3,
      'low': 2,
      'inactive': 1
    };
    
    const activeLevel = levelMap[level];
    
    if (barIndex <= activeLevel) {
      if (level === 'very-active') return 'bg-green-500';
      if (level === 'active') return 'bg-green-400';
      if (level === 'moderate') return 'bg-yellow-400';
      if (level === 'low') return 'bg-orange-400';
      return 'bg-gray-600';
    }
    
    return 'bg-gray-700';
  };

  const getActivityLabel = (): string => {
    switch (level) {
      case 'very-active': return 'Very Active';
      case 'active': return 'Active';
      case 'moderate': return 'Moderate';
      case 'low': return 'Low Activity';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const shouldPulse = level === 'very-active' || level === 'active';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-end gap-0.5">
        {[1, 2, 3, 4, 5].map((barIndex) => (
          <div
            key={barIndex}
            className={`
              w-1 transition-all duration-300
              ${getBarColor(barIndex)}
              ${shouldPulse && barIndex <= (level === 'very-active' ? 5 : 4) ? 'animate-pulse' : ''}
            `}
            style={{
              height: `${4 + barIndex * 3}px`
            }}
          />
        ))}
      </div>
      
      {showDetails && (
        <div className="text-xs">
          <div className="text-gray-400">{getActivityLabel()}</div>
          {(commitsLastMonth !== undefined || commitsLastWeek !== undefined) && (
            <div className="text-gray-500 mt-0.5">
              {commitsLastMonth !== undefined && commitsLastMonth > 0 ? (
                <>
                  <span>{commitsLastMonth} commits/month</span>
                  {commitsLastWeek !== undefined && commitsLastWeek > 0 && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{commitsLastWeek} this week</span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-xs italic">Based on push activity</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}