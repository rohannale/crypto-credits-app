import React from 'react';

const Logo = ({ size = 'medium', className = '', clickable = false, onClick }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl',
    xl: 'text-3xl'
  };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const logoContent = (
    <div className={`flex items-center space-x-3 ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-karma-lime to-karma-success rounded-xl flex items-center justify-center shadow-lg`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-3/4 h-3/4 text-karma-black"
        >
          {/* Star symbol */}
          <path
            d="M12 2L13.09 8.26L20 9L14.77 12.74L16.18 19.02L12 15.77L7.82 19.02L9.23 12.74L4 9L10.91 8.26L12 2Z"
            fill="currentColor"
          />
          {/* Inner glow effect */}
          <path
            d="M12 2L13.09 8.26L20 9L14.77 12.74L16.18 19.02L12 15.77L7.82 19.02L9.23 12.74L4 9L10.91 8.26L12 2Z"
            fill="currentColor"
            opacity="0.3"
            transform="scale(0.8)"
            transformOrigin="12 12"
          />
        </svg>
      </div>
      <span className={`font-bold text-karma-white ${textSizeClasses[size]} tracking-wide`}>
        KARMA
      </span>
    </div>
  );

  if (clickable) {
    return (
      <div onClick={handleClick}>
        {logoContent}
      </div>
    );
  }

  return logoContent;
};

export default Logo;
