import React from 'react';
import PropTypes from 'prop-types';

const CloseIcon = ({ width = 12, height = 12, className, ...props }) => (
  <svg
    role="img"
    width={width}
    height={height}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <title>Close this message</title>
    <path d="M10.092.072a.248.248 0 00-.35 0L6.176 3.64a.248.248 0 01-.35 0L2.258.072a.248.248 0 00-.35 0L.072 1.908a.248.248 0 000 .35L3.64 5.825a.248.248 0 010 .35L.072 9.742a.248.248 0 000 .35l1.836 1.836a.248.248 0 00.35 0L5.825 8.36a.248.248 0 01.35 0l3.567 3.568a.248.248 0 00.35 0l1.836-1.836a.248.248 0 000-.35L8.36 6.175a.248.248 0 010-.35l3.568-3.567a.248.248 0 000-.35L10.092.072z" />
  </svg>
);

CloseIcon.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

export default CloseIcon;
