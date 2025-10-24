import React from 'react';
import './styles.css';

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

export interface FormInputProps {
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
    <div className="form-input-container">
      {/* Label with required indicator */}
      <label htmlFor={name} className="form-input-label">
        {label} {required && <span className="form-input-required">*</span>}
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
        className={`form-input ${error ? 'form-input-error' : ''}`}
      />

      {/* Error message display */}
      {error && (
        <p className="form-input-error-message">{error}</p>
      )}
    </div>
  );
};

export default FormInput;