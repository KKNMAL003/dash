import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  type?: 'network' | 'server' | 'generic';
  className?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  showRetry = true,
  type = 'generic',
  className,
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          defaultTitle: 'Connection Error',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection.',
          iconColor: 'text-orange-500',
        };
      case 'server':
        return {
          icon: AlertTriangle,
          defaultTitle: 'Server Error',
          defaultMessage: 'Something went wrong on our end. Please try again later.',
          iconColor: 'text-red-500',
        };
      default:
        return {
          icon: AlertTriangle,
          defaultTitle: 'Something went wrong',
          defaultMessage: 'An unexpected error occurred. Please try again.',
          iconColor: 'text-red-500',
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <Card className={`p-8 text-center ${className}`}>
      <div className={`mx-auto h-16 w-16 ${config.iconColor} mb-4`}>
        <Icon className="h-full w-full" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {message || config.defaultMessage}
      </p>
      {showRetry && onRetry && (
        <Button
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-4 h-4" />}
          variant="primary"
        >
          Try Again
        </Button>
      )}
    </Card>
  );
}

interface ChartErrorStateProps {
  onRetry?: () => void;
  className?: string;
}

export function ChartErrorState({ onRetry, className }: ChartErrorStateProps) {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load chart data
        </h4>
        <p className="text-gray-600 text-center mb-4">
          Unable to fetch chart data. Please try refreshing.
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

interface TableErrorStateProps {
  onRetry?: () => void;
  className?: string;
}

export function TableErrorState({ onRetry, className }: TableErrorStateProps) {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex flex-col items-center justify-center py-8">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-3" />
        <h4 className="text-base font-medium text-gray-900 mb-2">
          Failed to load data
        </h4>
        <p className="text-gray-600 text-center text-sm mb-4">
          Unable to fetch table data. Please try again.
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
