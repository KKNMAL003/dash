export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export type DateRangePreset = '7days' | '30days' | '3months' | '6months' | '1year' | 'custom';

export function getDateRangeFromPreset(preset: DateRangePreset): DateRange {
  const end = new Date();
  const start = new Date();

  switch (preset) {
    case '7days':
      start.setDate(start.getDate() - 7);
      return { start, end, label: 'Last 7 Days' };
    
    case '30days':
      start.setDate(start.getDate() - 30);
      return { start, end, label: 'Last 30 Days' };
    
    case '3months':
      start.setMonth(start.getMonth() - 3);
      return { start, end, label: 'Last 3 Months' };
    
    case '6months':
      start.setMonth(start.getMonth() - 6);
      return { start, end, label: 'Last 6 Months' };
    
    case '1year':
      start.setFullYear(start.getFullYear() - 1);
      return { start, end, label: 'Last Year' };
    
    case 'custom':
    default:
      return { start, end, label: 'Custom Range' };
  }
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function parseDateFromInput(dateString: string): Date {
  return new Date(dateString + 'T00:00:00.000Z');
}

export function isValidDateRange(start: Date, end: Date): boolean {
  return start <= end && start <= new Date() && end <= new Date();
}

export function getDateRangeLabel(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString();
  const endStr = end.toLocaleDateString();
  return `${startStr} - ${endStr}`;
}

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '3months', label: 'Last 3 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: '1year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];
