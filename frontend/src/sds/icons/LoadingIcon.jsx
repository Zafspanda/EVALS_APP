import React from 'react';
import PropTypes from 'prop-types';

const LoadingIcon = ({ width = 16, height = 16, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    className={className}
    {...props}
  >
    <path
      fill="#33424F"
      fillRule="evenodd"
      d="M3.928 12.42a7.962 7.962 0 0 0 1.097 3.698l.4-1.49a1 1 0 1 1 1.931.518L6.321 19.01a1 1 0 0 1-1.225.707l-3.87-1.037a1 1 0 1 1 .518-1.931l1.58.423a9.962 9.962 0 0 1-1.394-4.66C1.68 6.993 5.95 2.317 11.466 2.067a9.977 9.977 0 0 1 3.727.538 1 1 0 0 1-.655 1.89 8 8 0 0 0-10.61 7.925Zm15.018-4.095a7.96 7.96 0 0 1 .936 3.76A8 8 0 0 1 8.924 19.52a1 1 0 0 0-.74 1.857 9.978 9.978 0 0 0 3.698.707c5.523 0 10-4.477 10-10a9.96 9.96 0 0 0-1.307-4.947l1.68.45a1 1 0 1 0 .518-1.931l-3.87-1.037a1 1 0 0 0-1.224.707L16.644 9.19a1 1 0 1 0 1.931.517l.37-1.382Z"
      clipRule="evenodd"
    />
  </svg>
);

LoadingIcon.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

export default LoadingIcon;
