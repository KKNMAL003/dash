// Accessibility utilities and helpers

// Generate unique IDs for ARIA attributes
let idCounter = 0;
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${++idCounter}`;
}

// Focus management utilities
export const focusUtils = {
  // Focus the first focusable element within a container
  focusFirst: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  },

  // Focus the last focusable element within a container
  focusLast: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    if (lastElement) {
      lastElement.focus();
    }
  },

  // Trap focus within a container (useful for modals)
  trapFocus: (container: HTMLElement, event: KeyboardEvent) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  },

  // Save and restore focus (useful for modals)
  saveFocus: (): HTMLElement | null => {
    return document.activeElement as HTMLElement;
  },

  restoreFocus: (element: HTMLElement | null) => {
    if (element && element.focus) {
      element.focus();
    }
  },
};

// Screen reader utilities
export const screenReaderUtils = {
  // Announce text to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('class', 'sr-only');
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  // Create visually hidden text for screen readers
  createScreenReaderText: (text: string): HTMLSpanElement => {
    const span = document.createElement('span');
    span.className = 'sr-only';
    span.textContent = text;
    return span;
  },
};

// Keyboard navigation utilities
export const keyboardUtils = {
  // Check if key is an action key (Enter or Space)
  isActionKey: (event: KeyboardEvent): boolean => {
    return event.key === 'Enter' || event.key === ' ';
  },

  // Check if key is an arrow key
  isArrowKey: (event: KeyboardEvent): boolean => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);
  },

  // Handle arrow key navigation in a list
  handleArrowNavigation: (
    event: KeyboardEvent,
    currentIndex: number,
    itemCount: number,
    onIndexChange: (newIndex: number) => void,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) => {
    const isVertical = orientation === 'vertical';
    const upKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
    const downKey = isVertical ? 'ArrowDown' : 'ArrowRight';

    if (event.key === upKey) {
      event.preventDefault();
      const newIndex = currentIndex > 0 ? currentIndex - 1 : itemCount - 1;
      onIndexChange(newIndex);
    } else if (event.key === downKey) {
      event.preventDefault();
      const newIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : 0;
      onIndexChange(newIndex);
    } else if (event.key === 'Home') {
      event.preventDefault();
      onIndexChange(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      onIndexChange(itemCount - 1);
    }
  },
};

// ARIA attribute helpers
export const ariaUtils = {
  // Generate ARIA attributes for expandable content
  getExpandableAttributes: (isExpanded: boolean, controlsId?: string) => ({
    'aria-expanded': isExpanded,
    ...(controlsId && { 'aria-controls': controlsId }),
  }),

  // Generate ARIA attributes for form fields
  getFieldAttributes: (
    labelId?: string,
    describedById?: string,
    required?: boolean,
    invalid?: boolean
  ) => ({
    ...(labelId && { 'aria-labelledby': labelId }),
    ...(describedById && { 'aria-describedby': describedById }),
    ...(required && { 'aria-required': true }),
    ...(invalid && { 'aria-invalid': true }),
  }),

  // Generate ARIA attributes for lists
  getListAttributes: (itemCount: number) => ({
    role: 'list',
    'aria-label': `List with ${itemCount} items`,
  }),

  getListItemAttributes: (index: number, total: number) => ({
    role: 'listitem',
    'aria-setsize': total,
    'aria-posinset': index + 1,
  }),

  // Generate ARIA attributes for tables
  getTableAttributes: (caption?: string) => ({
    role: 'table',
    ...(caption && { 'aria-label': caption }),
  }),

  getTableHeaderAttributes: () => ({
    role: 'columnheader',
    scope: 'col',
  }),

  getTableCellAttributes: () => ({
    role: 'cell',
  }),
};

// Color contrast utilities
export const contrastUtils = {
  // Check if color combination meets WCAG contrast requirements
  meetsContrastRequirement: (
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA'
  ): boolean => {
    // This is a simplified check - in a real app you'd use a proper contrast calculation library
    // For now, we'll assume light text on dark backgrounds and vice versa meet requirements
    const isLightOnDark = foreground.includes('white') && background.includes('gray');
    const isDarkOnLight = foreground.includes('gray') && background.includes('white');
    return isLightOnDark || isDarkOnLight;
  },
};

// High contrast mode detection
export const highContrastUtils = {
  // Detect if user prefers high contrast
  prefersHighContrast: (): boolean => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Detect if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
};

// Form accessibility helpers
export const formUtils = {
  // Generate accessible error message attributes
  getErrorAttributes: (fieldId: string, errorId: string, hasError: boolean) => ({
    ...(hasError && {
      'aria-describedby': errorId,
      'aria-invalid': true,
    }),
  }),

  // Generate accessible form group attributes
  getFormGroupAttributes: (labelId: string, fieldId: string, errorId?: string) => ({
    role: 'group',
    'aria-labelledby': labelId,
    ...(errorId && { 'aria-describedby': errorId }),
  }),
};
