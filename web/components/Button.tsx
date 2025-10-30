
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabledTooltip?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  disabledTooltip,
  ...props
}) => {
  const baseStyles = 'font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2';
  
  const variantStyles = {
    primary: 'bg-dmi-blue-700 text-white hover:bg-dmi-blue-800 focus:ring-dmi-blue-500',
    secondary: 'bg-gray-200 text-dmi-blue-800 hover:bg-gray-300 focus:ring-dmi-blue-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeStyles = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-2.5 px-5 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  const buttonElement = (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
  
  if (disabled && disabledTooltip) {
    return (
      <div className="relative group inline-block">
        {/* We need a span wrapper because the disabled button won't fire mouse events */}
        <span className="cursor-not-allowed">
           {buttonElement}
        </span>
        <div 
          role="tooltip" 
          className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-10 transition-opacity"
        >
          {disabledTooltip}
        </div>
      </div>
    );
  }

  return buttonElement;
};

export default Button;
