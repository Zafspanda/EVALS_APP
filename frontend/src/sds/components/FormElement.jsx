import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export const Label = ({ as = 'label', children, annotation, forCheckbox = false, id, ...props }) => {
  if (!children) return null;

  const LabelElement = as;
  const labelClass = classNames(forCheckbox ? 'sds-checkbox__label' : 'sds-form-element__label');
  const innerClass = classNames(forCheckbox && 'sds-form-element__label');

  const renderAnnotation = () => {
    if (typeof annotation === 'string') {
      return <span className="sds-form-element__annotation sds-meta--small">{annotation}</span>;
    }
    return annotation;
  };

  return (
    <LabelElement {...props} htmlFor={id} className={labelClass}>
      <span className={innerClass}>
        {children}
        {renderAnnotation()}
      </span>
    </LabelElement>
  );
};

export const Hint = ({ children }) => <span className="sds-form-element__hint" dangerouslySetInnerHTML={{ __html: children }} />;

export const ErrorBlock = ({ error }) => {
  let errors = error;
  const isString = (val) => typeof val === 'string';
  const hasError = validError(error);

  if (!hasError) {
    return null;
  }
  if (isString(error)) {
    errors = [error];
  }

  const errorBody = errors.map((e, i) => <div key={i} dangerouslySetInnerHTML={{ __html: e }} />);

  return <div className="sds-form-element__help">{errorBody}</div>;
};

const FormElement = ({ className, type = 'text', label, annotation, required, error, hint, id, ...props }) => {
  const classes = classNames('sds-form-element', className, validError(error) && 'sds-form--problem');

  return (
    <div className={classes}>
      {label && (
        <Label id={id} required={required} annotation={annotation}>
          <span dangerouslySetInnerHTML={{ __html: label }}></span>
        </Label>
      )}
      {props.children}
      <ErrorBlock error={error} />
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
};

export function validError(error) {
  const isArray = Array.isArray(error) && error.length > 0;
  const isString = typeof error === 'string' && error.length > 0;
  let isValid = false;

  if (isString) {
    isValid = true;
  }

  if (isArray && error.some(Boolean)) {
    isValid = true;
  }

  return isValid;
}

FormElement.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string,
  required: PropTypes.bool,
  annotation: PropTypes.element,
  label: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  id: PropTypes.string,
};

export default FormElement;
