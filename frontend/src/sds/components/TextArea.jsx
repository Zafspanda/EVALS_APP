import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import FormElement, { validError } from './FormElement';

const TextArea = forwardRef((props, ref) => {
  const { className, ...restProps } = props;
  const { required } = props;
  const classes = classNames('sds-form-element', className);

  return (
    <FormElement {...restProps} className={classes}>
      <div className="sds-form-element__control">
        <textarea
          {...restProps}
          required={required}
          className="sds-form-element__item sds-input"
          aria-invalid={validError(restProps.error)}
          ref={ref}
        />
      </div>
    </FormElement>
  );
});

TextArea.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  required: PropTypes.bool,
  annotation: PropTypes.element,
  label: PropTypes.string,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

export default TextArea;
