import React from 'react';
import PropTypes from 'prop-types';

const CircleCrossFilledIcon = ({
  width = 24,
  height = 24,
  className,
  color,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    className={className}
    style={color ? { color } : undefined}
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm3.535 6.465a.833.833 0 0 0-1.178 0L12 10.82 9.643 8.465a.832.832 0 1 0-1.178 1.178L10.82 12l-2.356 2.357a.833.833 0 1 0 1.178 1.178l2.356-2.356 2.358 2.356a.833.833 0 1 0 1.178-1.178l-2.357-2.356 2.357-2.358a.832.832 0 0 0 0-1.178Z"
    />
  </svg>
);

CircleCrossFilledIcon.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  color: PropTypes.string,
};

export default CircleCrossFilledIcon;
