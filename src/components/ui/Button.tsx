import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyle = "rounded border font-semibold tracking-wider transition-all duration-200 active:scale-95 disabled:pointer-events-none";
  
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base"
  };

  const variantStyles = {
    primary: "gothic-btn",
    secondary: "gothic-btn-secondary"
  };
  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
