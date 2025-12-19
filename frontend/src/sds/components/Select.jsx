import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import FormElement, { validError } from './FormElement';

class Select extends React.Component {
  constructor() {
    super();
    this.state = {
      pristine: true,
    };
  }

  optionList(options) {
    let optionsArray = Array.isArray(options) ? options : [options];

    if (options) {
      return optionsArray.map((option, i) => {
        if (typeof option === 'string') {
          return (
            <option key={i} value={option}>
              {option}
            </option>
          );
        } else if (option.type === 'option') {
          // if the option is a react <option /> element
          return option;
        } else if (option.children && option.text) {
          // recursively call method to generate group options
          return (
            <optgroup key={i} label={option.text}>
              {this.optionList(option.children)}
            </optgroup>
          );
        } else {
          return (
            <option
              key={i}
              value={option.value || option.text}
              disabled={!!option.disabled}
            >
              {option.text}
            </option>
          );
        }
      });
    } else {
      throw Error('SDS `Select` requires options');
    }
  }

  getDefaultValue(options) {
    if (!options) return undefined;

    let optionsArray = Array.isArray(options) ? options : [options];

    for (let option of optionsArray) {
      if (typeof option === 'object' && option.selected) {
        return option.value || option.text;
      }
      if (option.children) {
        const nestedDefault = this.getDefaultValue(option.children);
        if (nestedDefault) return nestedDefault;
      }
    }
    return undefined;
  }

  componentDidMount() {
    if (!!this.selectElement.value) {
      this.setState({ pristine: false });
    }
  }

  handleChange(e) {
    this.setState({ pristine: false });
    if (this.props.onChange) {
      this.props.onChange(e);
    }
  }

  render() {
    const { className, options, children, placeholder, ...props } = this.props;
    const { required, disabled } = this.props;
    const wrapperClasses = classNames('sds-form-element', className);
    const elementClasses = classNames(
      'sds-select',
      'sds-form-element__item',
      placeholder && this.state.pristine && 'sds-select--placeholder'
    );
    const defaultValue = this.getDefaultValue(options);

    return (
      <FormElement {...props} className={wrapperClasses}>
        <div className="sds-form-element__control">
          <div className="sds-select-wrap">
            <select
              {...props}
              ref={(el) => (this.selectElement = el)}
              className={elementClasses}
              required={required}
              disabled={disabled}
              aria-invalid={validError(props.error)}
              onChange={this.handleChange.bind(this)}
              defaultValue={defaultValue}
            >
              {placeholder && (
                <option value="" disabled>
                  {placeholder}
                </option>
              )}
              {this.optionList(options || children)}
            </select>
          </div>
        </div>
      </FormElement>
    );
  }
}

Select.propTypes = {
  className: PropTypes.string,
  required: PropTypes.bool,
  annotation: PropTypes.element,
  label: PropTypes.string,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  placeholder: PropTypes.string,
  options: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
        PropTypes.shape({
          text: PropTypes.string.isRequired,
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          disabled: PropTypes.bool,
          selected: PropTypes.bool,
        }),
      ])
    ),
  ]),
};

export default Select;
