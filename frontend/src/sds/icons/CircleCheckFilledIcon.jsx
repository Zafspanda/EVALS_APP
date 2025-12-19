import React from 'react';
import PropTypes from 'prop-types';

const CircleCheckFilledIcon = ({
  width = 16,
  height = 16,
  className,
  color,
  ...props
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={color ? { color } : undefined}
    {...props}
  >
    <circle cx="8" cy="8" r="7" fill="currentColor" stroke="none" />
    <path
      d="M5 8L7 10L11 6"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

CircleCheckFilledIcon.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  color: PropTypes.string,
};

export default CircleCheckFilledIcon;
