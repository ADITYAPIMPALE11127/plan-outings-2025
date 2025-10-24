import React from 'react';

/**
 * FormInput Component
 *
 * A reusable input field component with label, validation, and error display
 *
 * @param label - Text label for the input field
 * @param type - Input type (text, email, password, tel, etc.)
 * @param name - Name attribute for the input
 * @param value - Controlled value of the input
 * @param onChange - Handler function when input changes
 * @param error - Error message to display (if any)
 * @param placeholder - Placeholder text
 * @param required - Whether the field is required
 * @param maxLength - Maximum character length
 * @param pattern - HTML5 pattern validation
 */

interface FormInputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  maxLength,
  pattern,
}) => {
  return (
    <div className="mb-4 sm:mb-5">
      {/* Label with required indicator */}
      <label htmlFor={name} className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input field */}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        pattern={pattern}
        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />

      {/* Error message display */}
      {error && (
        <p className="mt-1.5 text-xs sm:text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FormInput;
