import React from 'react';

const TypewriterText = ({ text, className = '', onAnimationComplete }) => {
  // Display the full text immediately without any animations
  const displayText = "Imagine waking up every morning knowing the universe has your back. No more random chaos. No more 'bad luck streaks.' Just you, living your best life, with the cosmic forces subtly aligned in your favor.";

  return (
    <span className={className}>
      {displayText}
    </span>
  );
};

export default TypewriterText;
