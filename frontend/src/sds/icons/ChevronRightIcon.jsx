import React from 'react';
import PropTypes from 'prop-types';

const ChevronRightIcon = ({ width = 16, height = 16, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    className={className}
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M.293 17.707a1 1 0 0 1 0-1.414L7.586 9 .293 1.707A1 1 0 0 1 1.707.293l8 8a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0Z"
      clipRule="evenodd"
    />
  </svg>
);

ChevronRightIcon.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

export default ChevronRightIcon;
