import React, { useState, useCallback } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import {
  DateRange,
  DateRangePreset,
  getDateRangeFromPreset,
  formatDateForInput,
  parseDateFromInput,
  isValidDateRange,
  getDateRangeLabel,
  DATE_RANGE_PRESETS,
} from '../../utils/dateRange';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  className,
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>('6months');
  const [customStart, setCustomStart] = useState(formatDateForInput(value.start));
  const [customEnd, setCustomEnd] = useState(formatDateForInput(value.end));
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  const handlePresetChange = useCallback((preset: DateRangePreset) => {
    setSelectedPreset(preset);
    
    if (preset === 'custom') {
      setShowCustomInputs(true);
    } else {
      setShowCustomInputs(false);
      const newRange = getDateRangeFromPreset(preset);
      onChange(newRange);
      setIsOpen(false);
    }
  }, [onChange]);

  const handleCustomDateChange = useCallback(() => {
    const start = parseDateFromInput(customStart);
    const end = parseDateFromInput(customEnd);
    
    if (isValidDateRange(start, end)) {
      const customRange: DateRange = {
        start,
        end,
        label: getDateRangeLabel(start, end),
      };
      onChange(customRange);
      setIsOpen(false);
      setShowCustomInputs(false);
    }
  }, [customStart, customEnd, onChange]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setShowCustomInputs(false);
    setCustomStart(formatDateForInput(value.start));
    setCustomEnd(formatDateForInput(value.end));
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        variant="secondary"
        leftIcon={<Calendar className="w-4 h-4" />}
        rightIcon={<ChevronDown className="w-4 h-4" />}
        className="min-w-[200px] justify-between"
      >
        {value.label}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Select Date Range</h4>
            
            {/* Preset Options */}
            <div className="space-y-2 mb-4">
              {DATE_RANGE_PRESETS.map((preset) => (
                <label key={preset.value} className="flex items-center">
                  <input
                    id={`date-preset-${preset.value}`}
                    type="radio"
                    name="dateRange"
                    value={preset.value}
                    checked={selectedPreset === preset.value}
                    onChange={() => handlePresetChange(preset.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{preset.label}</span>
                </label>
              ))}
            </div>

            {/* Custom Date Inputs */}
            {showCustomInputs && (
              <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    id="custom-start-date"
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    max={formatDateForInput(new Date())}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    id="custom-end-date"
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    min={customStart}
                    max={formatDateForInput(new Date())}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              {showCustomInputs && (
                <Button
                  size="sm"
                  onClick={handleCustomDateChange}
                  disabled={!isValidDateRange(
                    parseDateFromInput(customStart),
                    parseDateFromInput(customEnd)
                  )}
                >
                  Apply
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
