import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ChevronRightIcon from '../icons/ChevronRightIcon';
import Divider from './Divider';

const TOP = 'top';
const CENTER = 'center';

const ListItemIcon = ({ children, className, ...props }) => {
  return (
    <div className={classNames('sds-list-item__icon', className)} {...props}>
      {children}
    </div>
  );
};

ListItemIcon.propTypes = {
  /** Content to render inside the avatar (typically an icon) */
  children: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
};

const ListItemAvatar = ({ children, className, ...props }) => {
  return (
    <div className={classNames('sds-list-item__avatar', className)} {...props}>
      {children}
    </div>
  );
};

ListItemAvatar.propTypes = {
  /** Content to render inside the avatar (typically an icon) */
  children: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
};

const ListItemText = ({ title, primaryText, secondaryText }) => {
  const displayText = title || primaryText;
  return (
    <div className="sds-list-item__text">
      <div className="sds-list-item__primary">{displayText}</div>
      {secondaryText && (
        <div className="sds-list-item__secondary">{secondaryText}</div>
      )}
    </div>
  );
};

ListItemText.propTypes = {
  /** The primary text content (optional) - alias for primaryText */
  title: PropTypes.string,
  /** The primary text content (optional) */
  primaryText: PropTypes.string,
  /** The secondary text content (optional) */
  secondaryText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

const ListItemButton = ({ children, className, isActive = true, ...props }) => {
  const classes = classNames('sds-list-item__button', className, {
    'sds-list-item__button--inactive': !isActive,
  });

  return (
    <div className={classes} {...props}>
      {children}
      <ChevronRightIcon
        className="sds-list-item__button-chevron"
        width={16}
        height={18}
      />
    </div>
  );
};

ListItemButton.propTypes = {
  /** Whether the button item is active */
  isActive: PropTypes.bool,
  /** Content to render inside the button area */
  children: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
};

const ListItem = ({
  align = CENTER,
  hasSpacing = true,
  hasDivider = false,
  className,
  onClick,
  children,
  secondaryAction,
  isCompact = false,
  isActive = true,
  ...props
}) => {
  const classes = classNames('sds-list-item', className, {
    'sds-list-item--with_spacing': hasSpacing,
    'sds-list-item--inactive': !isActive,
  });

  return (
    <li className={classes} onClick={onClick} {...props}>
      <div
        className={classNames('sds-list-item__content', {
          'sds-list-item__content--align-top': align === TOP,
          'sds-list-item__content--compact': isCompact,
        })}
      >
        {children}
        {secondaryAction && (
          <div className="sds-list-item__secondary-action">
            {secondaryAction}
          </div>
        )}
      </div>
      {hasDivider && <Divider />}
    </li>
  );
};

ListItem.propTypes = {
  /** Whether to show spacing around the item */
  hasSpacing: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Click handler for the entire item */
  onClick: PropTypes.func,
  /** Content to render inside the list item */
  children: PropTypes.node,
  /** Secondary action element (e.g., Button) to display on the right */
  secondaryAction: PropTypes.node,
  /** Whether the list item is disabled */
  isActive: PropTypes.bool,
};

export default ListItem;
export { ListItemIcon, ListItemAvatar, ListItemText, ListItemButton };
