import React, { useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ResponsiveChartProps {
  children: React.ReactNode;
  height?: number;
  mobileHeight?: number;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function ResponsiveChart({
  children,
  height = 300,
  mobileHeight = 250,
  className,
  title,
  subtitle,
  actions,
}: ResponsiveChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chartHeight = isMobile ? mobileHeight : height;

  return (
    <div className={`card p-4 md:p-6 ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="mt-3 sm:mt-0">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Specialized chart containers for common use cases
interface MetricChartProps extends Omit<ResponsiveChartProps, 'children'> {
  children: React.ReactNode;
  metric?: string;
  period?: string;
  onMetricChange?: (metric: string) => void;
  onPeriodChange?: (period: string) => void;
  metricOptions?: { value: string; label: string }[];
  periodOptions?: { value: string; label: string }[];
}

export function MetricChart({
  children,
  metric,
  period,
  onMetricChange,
  onPeriodChange,
  metricOptions = [],
  periodOptions = [],
  ...props
}: MetricChartProps) {
  const actions = (
    <div className="flex flex-col sm:flex-row gap-2">
      {metricOptions.length > 0 && onMetricChange && (
        <select
          id="chart-metric"
          value={metric}
          onChange={(e) => onMetricChange(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
        >
          {metricOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      {periodOptions.length > 0 && onPeriodChange && (
        <select
          id="chart-period"
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
        >
          {periodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  return (
    <ResponsiveChart {...props} actions={actions}>
      {children}
    </ResponsiveChart>
  );
}

// Mobile-optimized grid layout for charts
interface ChartGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ChartGrid({ children, className }: ChartGridProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 ${className}`}>
      {children}
    </div>
  );
}

// Responsive stat card grid that works well on mobile
interface ResponsiveStatGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export function ResponsiveStatGrid({ 
  children, 
  className,
  columns = { mobile: 1, tablet: 2, desktop: 4 }
}: ResponsiveStatGridProps) {
  const gridClasses = `grid gap-4 md:gap-6 
    grid-cols-${columns.mobile} 
    sm:grid-cols-${columns.tablet} 
    lg:grid-cols-${columns.desktop}`;

  return (
    <div className={`${gridClasses} ${className}`}>
      {children}
    </div>
  );
}
