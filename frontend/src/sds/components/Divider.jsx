import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Divider = ({ className, ...props }) => {
  const classes = classNames('sds-divider', className);

  return <div className={classes} {...props} />;
};

Divider.propTypes = {
  /** Additional CSS classes */
  className: PropTypes.string,
};

Divider.displayName = 'Divider';

export default Divider;
