import type { JSX } from 'hono/jsx';

interface CheckboxProps {
  name: string;
  id?: string;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  value?: string;
  className?: string;
  onChange?: string;
}

export const Checkbox = ({
  name,
  id,
  label,
  checked = false,
  disabled = false,
  required = false,
  value,
  className = '',
  onChange
}: CheckboxProps): JSX.Element => {
  
  const checkboxId = id || name;
  
  const checkboxClasses = `
    w-5 h-5 rounded
    border-2 border-gray-300
    text-primary
    focus:ring-2 focus:ring-primary focus:ring-offset-1
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}
    transition-colors duration-200
  `;
  
  const labelClasses = `
    ml-2 text-sm font-medium text-gray-700
    ${disabled ? 'text-gray-400' : 'cursor-pointer'}
  `;
  
  return (
    <div class={`flex items-center ${className}`}>
      <input
        type="checkbox"
        name={name}
        id={checkboxId}
        class={checkboxClasses}
        checked={checked}
        disabled={disabled}
        required={required}
        value={value}
        onchange={onChange}
      />
      {label && (
        <label for={checkboxId} class={labelClasses}>
          {label}
          {required && <span class="text-red-500 ml-1">*</span>}
        </label>
      )}
    </div>
  );
};
