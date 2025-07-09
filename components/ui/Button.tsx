import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: 'bg-blue-600 hover:bg-blue-700',
  secondary: 'bg-gray-600 hover:bg-gray-700',
  success: 'bg-green-600 hover:bg-green-700',
  warning: 'bg-yellow-600 hover:bg-yellow-700',
  danger: 'bg-red-600 hover:bg-red-700',
};

const sizeStyles = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'text-white font-bold rounded-lg transition-colors';
  const disabledStyles = 'disabled:bg-gray-600 disabled:cursor-not-allowed';
  
  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`;
  
  return (
    <button 
      className={finalClassName}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}