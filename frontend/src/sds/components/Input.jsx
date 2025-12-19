import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BaseInput from './BaseInput';
import FormElement, { validError } from './FormElement';
import SearchIcon from '../icons/SearchIcon';

const Prepend = ({ text }) =>
  text && (
    <span className="sds-form-element--surround-text sds-form-element--surround-text-prepend">
      {text}
    </span>
  );

const Append = ({ text }) =>
  text && (
    <span className="sds-form-element--surround-text sds-form-element--surround-text-append">
      {text}
    </span>
  );

const Input = forwardRef((props, ref) => {
  const { className, prepend, append, ...restProps } = props;
  const { required } = props;
  const classes = classNames('sds-form-element', className);
  const controlClasses = classNames(
    'sds-form-element__control',
    (prepend || append) && 'sds-form-element__control--surround-text'
  );

  return (
    <FormElement {...restProps} className={classes}>
      <div className={controlClasses}>
        {restProps.type === 'search' && (
          <span
            className="sds-form-element--surround-text sds-form-element--surround-text-prepend"
            style={{ lineHeight: 1 }}
          >
            <SearchIcon />
          </span>
        )}
        {prepend && <Prepend text={prepend} />}
        <BaseInput
          {...restProps}
          required={required}
          className="sds-form-element__item sds-input"
          aria-invalid={validError(restProps.error)}
          ref={ref}
        />
        {append && <Append text={append} />}
      </div>
    </FormElement>
  );
});

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  required: PropTypes.bool,
  annotation: PropTypes.element,
  label: PropTypes.string,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  prepend: PropTypes.string,
  append: PropTypes.string,
};

export default Input;
