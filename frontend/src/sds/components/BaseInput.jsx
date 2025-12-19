import React, { createElement, forwardRef } from 'react';
import PropTypes from 'prop-types';

// linkedInput exists for the sole purpose of supporting legacy Sendle React
// components that use valueLink properties. These aren't supported in React
// 16+ so if a prop is passed in then use LinkedInput instead.
const BaseInput = forwardRef(({ linkedInput, ...restProps }, ref) => {
  const { children, ...props } = restProps;

  if (linkedInput) {
    return createElement(linkedInput, { ...props }, children);
  }

  return (<input {...restProps} ref={ref} />);
});

BaseInput.propTypes = {
  linkedInput: PropTypes.elementType,
};

export default BaseInput;
