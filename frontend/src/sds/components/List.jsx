import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Divider from './Divider';

const ListSubheader = ({ children, className, ...props }) => {
  const classes = classNames('sds-list__subheader', className);

  return (
    <li className={classes} {...props}>
      {children}
      <Divider className="sds-u-m_top--xs sds-u-m_bottom--xs" />
    </li>
  );
};

const List = ({ className, subheader, children }) => {
  const classes = classNames('sds-list', className);

  return (
    <ul className={classes}>
      {subheader && <ListSubheader>{subheader}</ListSubheader>}
      {children}
    </ul>
  );
};

List.propTypes = {
  /** Additional CSS classes */
  className: PropTypes.string,
};

List.displayName = 'List';

export default List;
export { ListSubheader };
