import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CloseIcon from '../icons/CloseIcon';

const Alert = ({
  className,
  children,
  variant = 'info',
  inline,
  title,
  onClose,
}) => {
  const classes = classNames(
    className,
    'sds-alert-message',
    variant && `sds-alert-message--${variant}`,
    inline && `sds-alert-message--inline`
  );
  let elementRef = null;

  const handleClose = (e) => {
    e.preventDefault();
    elementRef.style.display = 'none';

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={classes} ref={(el) => (elementRef = el)}>
      <div className="sds-alert-message__content">
        <strong className="sds-alert-message__title">{title} </strong>
        {children}
      </div>
      {!inline && (
        <div className="sds-alert-message__actions">
          <button
            title="Close this message"
            className="sds-button sds-button--link sds-alert-message__close"
            onClick={handleClose}
          >
            <span className="sds-button__text">
              <CloseIcon />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

Alert.propTypes = {
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'risk']),
  title: PropTypes.string,
  onClose: PropTypes.func,
};

export default Alert;
