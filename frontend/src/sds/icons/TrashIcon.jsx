import React from 'react';
import PropTypes from 'prop-types';

const TrashIcon = ({ width = 16, height = 16, className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <path
      fill="#33424F"
      d="M9.305 1.333c.8 0 1.449.65 1.449 1.45v.29h3.333a.58.58 0 0 1 0 1.158h-.336l-.825 9.904a.58.58 0 0 1-.578.532H3.652a.58.58 0 0 1-.578-.532L2.25 4.23h-.336a.58.58 0 1 1 0-1.159h3.333v-.29c0-.8.65-1.449 1.45-1.449h2.609Zm-5.12 12.174h7.63l.773-9.276H3.413l.773 9.276Zm2.51-7.39c.32 0 .58.258.58.578v4.349a.58.58 0 0 1-1.159 0V6.695c0-.32.26-.579.58-.579Zm2.61 0c.32 0 .579.258.579.578v4.349a.58.58 0 0 1-1.16 0V6.695c0-.32.26-.579.58-.579Zm-2.61-3.624a.29.29 0 0 0-.289.29v.29h3.188v-.29a.29.29 0 0 0-.29-.29H6.696Z"
    />
  </svg>
);

TrashIcon.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
};

export default TrashIcon;
