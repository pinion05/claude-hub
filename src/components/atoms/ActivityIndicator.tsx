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
  // Define how many bars should be filled for each activity level
  const ACTIVITY_CONFIG = {
    'very-active': {
      filledBars: 5,
      color: 'bg-green-500',
      label: 'Very Active',
      pulse: true
    },
    'active': {
      filledBars: 5,  // Changed from 4 to 5 - active now fills all bars
      color: 'bg-green-400',
      label: 'Active',
      pulse: true
    },
    'moderate': {
      filledBars: 3,
      color: 'bg-yellow-400',
      label: 'Moderate',
      pulse: false
    },
    'low': {
      filledBars: 2,
      color: 'bg-orange-400',
      label: 'Low Activity',
      pulse: false
    },
    'inactive': {
      filledBars: 1,
      color: 'bg-gray-500',
      label: 'Inactive',
      pulse: false
    }
  };

  const config = ACTIVITY_CONFIG[level];

  const getBarStyles = (barIndex: number) => {
    const isFilled = barIndex <= config.filledBars;
    const shouldAnimate = config.pulse && isFilled;
    
    return {
      className: `
        w-1 transition-all duration-300
        ${isFilled ? config.color : 'bg-gray-700'}
        ${shouldAnimate ? 'animate-pulse' : ''}
      `,
      height: `${4 + barIndex * 3}px`
    };
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-end gap-0.5">
        {[1, 2, 3, 4, 5].map((barIndex) => {
          const styles = getBarStyles(barIndex);
          return (
            <div
              key={barIndex}
              className={styles.className}
              style={{ height: styles.height }}
              aria-hidden="true"
            />
          );
        })}
      </div>
      
      {showDetails && (
        <div className="text-xs">
          <div className="text-gray-400">{config.label}</div>
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