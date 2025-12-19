import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const IconButton = ({
  variant,
  size,
  appearance,
  className,
  children,
  as = 'button',
  ...props
}) => {
  const Component = props.href ? 'a' : as;
  const classes = classNames(
    className,
    'sds-icon-button',
    variant && `sds-icon-button--${variant}`,
    size && `sds-icon-button--${size}`,
    appearance && `sds-icon-button--${appearance}`
  );

  return (
    <Component {...props} className={classes}>
      {children}
    </Component>
  );
};

IconButton.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'risk']),
  appearance: PropTypes.oneOf(['ghost', 'link']),
  size: PropTypes.oneOf(['x_small', 'small', 'large']),
  className: PropTypes.string,
  as: PropTypes.string,
  href: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default IconButton;
