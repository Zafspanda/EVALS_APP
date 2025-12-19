import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Badge = ({
  children,
  badgeContent,
  color = 'default',
  align = 'top-right',
  className,
  ...props
}) => {
  return (
    <div className="sds-badge-container" {...props}>
      {children}
      <div
        className={classNames(
          'sds-badge',
          `sds-badge--${color}`,
          `sds-badge--${align}`,
          className
        )}
      >
        <div className="sds-badge__background" />
        {badgeContent}
      </div>
    </div>
  );
};

Badge.propTypes = {
  /** The element to display the badge on (typically an Avatar) */
  children: PropTypes.node,
  /** Content to render inside the badge (typically an icon or number) */
  badgeContent: PropTypes.node,
  /** The color variant of the badge */
  color: PropTypes.oneOf(['default', 'inactive', 'success']),
  /** The alignment position of the badge */
  align: PropTypes.oneOf([
    'top-right',
    'bottom-right',
    'top-left',
    'bottom-left',
  ]),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Badge;
