import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { focusUtils, generateId } from '../../utils/accessibility';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  initialFocus?: React.RefObject<HTMLElement>;
  finalFocus?: React.RefObject<HTMLElement>;
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  initialFocus,
  finalFocus,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = React.useMemo(() => generateId('modal-title'), []);
  const descriptionId = React.useMemo(() => generateId('modal-description'), []);

  // Save focus when modal opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = focusUtils.saveFocus();
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else {
        focusUtils.focusFirst(modalRef.current);
      }
    }
  }, [isOpen, initialFocus]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (finalFocus?.current) {
        finalFocus.current.focus();
      } else {
        focusUtils.restoreFocus(previousFocusRef.current);
      }
    }
  }, [isOpen, finalFocus]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen || !modalRef.current) return;

    if (event.key === 'Escape' && closeOnEscape) {
      event.preventDefault();
      onClose();
    } else if (event.key === 'Tab') {
      focusUtils.trapFocus(modalRef.current, event);
    }
  }, [isOpen, closeOnEscape, onClose]);

  // Handle overlay click
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={clsx(
          'relative w-full bg-white rounded-lg shadow-xl',
          'transform transition-all max-h-[90vh] overflow-hidden',
          sizes[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2
            id={titleId}
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            ariaLabel="Close modal"
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div
          id={descriptionId}
          className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}