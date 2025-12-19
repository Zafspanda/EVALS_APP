import React from 'react';
import PropTypes from 'prop-types';

const SearchIcon = ({ width = 16, height = 16, className, ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <title>icon-magnifying-glass</title>
    <g
      stroke="none"
      strokeWidth="1"
      fill="none"
      fillRule="evenodd"
      strokeLinejoin="round"
    >
      <g stroke="#7A8691" strokeWidth="2">
        <path d="M11.7969455,6.26414545 C11.7969455,9.32014545 9.3184,11.7986909 6.2624,11.7986909 C3.20494545,11.7986909 0.727854545,9.32014545 0.727854545,6.26414545 C0.727854545,3.20523636 3.20494545,0.726690909 6.2624,0.726690909 C9.3184,0.726690909 11.7969455,3.20523636 11.7969455,6.26414545 L11.7969455,6.26414545 Z" />
        <line
          x1="10.1818182"
          y1="10.1818182"
          x2="15.2727273"
          y2="15.2727273"
          strokeLinecap="round"
        />
      </g>
    </g>
  </svg>
);

SearchIcon.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

export default SearchIcon;
