import type { JSX } from 'hono/jsx';

interface BadgeProps {
  children: any;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  icon?: string;
  className?: string;
}

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  icon,
  className = ''
}: BadgeProps): JSX.Element => {
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-300',
    primary: 'bg-blue-100 text-blue-800 border-blue-300',
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    danger: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
  
  const roundedClass = rounded ? 'rounded-full' : 'rounded';
  
  const badgeClasses = `
    badge inline-flex items-center gap-1.5 font-medium border
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${roundedClass}
    ${className}
  `;
  
  return (
    <span class={badgeClasses}>
      {icon && <i class={icon}></i>}
      {children}
    </span>
  );
};
