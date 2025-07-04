import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from './Card';

interface StatCardProps {
  name: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  name,
  value,
  icon: Icon,
  color,
  change,
  trend = 'neutral',
  className,
  onClick,
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };

  return (
    <Card
      className={clsx(
        'p-4 sm:p-6 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={clsx('p-3 rounded-lg flex-shrink-0', color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 truncate" title={name}>{name}</p>
          <div className="flex items-center flex-wrap gap-1">
            <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate" title={String(value)}>
              {value}
            </p>
            {change && (
              <span className={clsx(
                'text-xs sm:text-sm font-medium whitespace-nowrap',
                trendColors[trend]
              )}>
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface StatCardGridProps {
  stats: Array<{
    name: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    onClick?: () => void;
  }>;
  className?: string;
}

export function StatCardGrid({ stats, className }: StatCardGridProps) {
  return (
    <div className={clsx(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
      className
    )}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          name={stat.name}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          change={stat.change}
          trend={stat.trend}
          onClick={stat.onClick}
        />
      ))}
    </div>
  );
}
