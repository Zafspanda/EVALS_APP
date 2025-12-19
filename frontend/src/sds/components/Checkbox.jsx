import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BaseInput from './BaseInput';
import { Label, Hint, ErrorBlock, validError } from './FormElement';

const Checkbox = ({
  error,
  label,
  hint,
  children,
  className,
  block,
  accent,
  annotation,
  ...props
}) => {
  const classes = classNames(
    'sds-checkbox',
    block && 'sds-checkbox--block',
    block && accent && 'sds-checkbox--accent',
    validError(error) && 'sds-form--problem',
    className
  );
  return (
    <div className={classes}>
      <BaseInput {...props} type="checkbox" />
      {label && (
        <Label {...props} annotation={annotation} forCheckbox>
          <span className="sds-checkbox_faux" />
          <span dangerouslySetInnerHTML={{ __html: label }} />
        </Label>
      )}
      <ErrorBlock error={error} />
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
};

Checkbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  className: PropTypes.string,
  block: PropTypes.bool,
  accent: PropTypes.bool,
  required: PropTypes.bool,
  annotation: PropTypes.string,
  hint: PropTypes.string,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

export default Checkbox;
