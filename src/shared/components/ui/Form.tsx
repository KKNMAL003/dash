import React from 'react';
import { clsx } from 'clsx';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export function Form({ children, className, ...props }: FormProps) {
  return (
    <form className={clsx('space-y-6', className)} {...props}>
      {children}
    </form>
  );
}

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return <div className={clsx('space-y-1', className)}>{children}</div>;
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ children, required, className, ...props }: FormLabelProps) {
  return (
    <label
      className={clsx('block text-sm font-medium text-gray-700', className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function FormInput({ error, className, ...props }: FormInputProps) {
  return (
    <>
      <input
        className={clsx(
          'input',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <FormError>{error}</FormError>}
    </>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function FormTextarea({ error, className, ...props }: FormTextareaProps) {
  return (
    <>
      <textarea
        className={clsx(
          'input min-h-[100px] resize-y',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <FormError>{error}</FormError>}
    </>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function FormSelect({ error, options, placeholder, className, ...props }: FormSelectProps) {
  return (
    <>
      <select
        className={clsx(
          'input',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <FormError>{error}</FormError>}
    </>
  );
}

interface FormErrorProps {
  children: React.ReactNode;
}

export function FormError({ children }: FormErrorProps) {
  return <p className="text-sm text-red-600">{children}</p>;
}

interface FormHelpProps {
  children: React.ReactNode;
}

export function FormHelp({ children }: FormHelpProps) {
  return <p className="text-sm text-gray-500">{children}</p>;
}