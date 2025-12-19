import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Status = ({ state, text, size }) => {
  const classes = classNames(
    'sds-status',
    state && `sds-status--${state}`,
    size && `sds-status--${size}`
  );
  return (
    <span className={classes}>
      <span className="sds-status__indicator"></span>
      {text && <span className="sds-status__text">{text}</span>}
    </span>
  );
};

Status.propTypes = {
  state: PropTypes.oneOf(['info', 'success', 'warning', 'risk', 'disabled']),
  text: PropTypes.string,
  size: PropTypes.oneOf(['small', 'base', 'large']),
};

export default Status;
