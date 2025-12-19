import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Button = ({
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
    'sds-button',
    variant && `sds-button--${variant}`,
    size && `sds-button--${size}`,
    appearance && `sds-button--${appearance}`
  );

  return (
    <Component {...props} className={classes}>
      <span className="sds-button__text">{props.value || children}</span>
    </Component>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'risk']),
  appearance: PropTypes.oneOf(['ghost', 'link']),
  size: PropTypes.oneOf(['x_small', 'small', 'large']),
  className: PropTypes.string,
  as: PropTypes.string,
  href: PropTypes.string,
};

export default Button;
