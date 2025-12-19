import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const LEFT = 'left';
const CENTER = 'center';

const TypeBlock = ({
  title,
  description,
  primaryText,
  secondaryText,
  isReversed = false,
  className,
  align = LEFT,
  ...props
}) => {
  const classes = classNames('sds-type-block', className);

  return (
    <div className={classes} {...props}>
      <div
        className={classNames('sds-type-block__content', {
          'sds-type-block__content--with-title': !!title,
          'sds-type-block__content--reversed': isReversed,
          'sds-type-block__content--centered': align === CENTER,
        })}
      >
        {title && <h2 className="sds-type-block__heading">{title}</h2>}
        {!title && primaryText && (
          <h2 className="sds-type-block__primary">{primaryText}</h2>
        )}
        {description && (
          <p className="sds-type-block__description">{description}</p>
        )}
        {!description && secondaryText && (
          <div className="sds-type-block__secondary">{secondaryText}</div>
        )}
      </div>
    </div>
  );
};

TypeBlock.propTypes = {
  /** Title is used for headings */
  title: PropTypes.string,
  /** Description text to accompany title */
  description: PropTypes.string,
  /** Primary text acts as a subheader */
  primaryText: PropTypes.string,
  /** Secondary text acts as secondary information */
  secondaryText: PropTypes.string,
  /** reverses the ordering of the primary and secondary text */
  isReversed: PropTypes.bool,
  /** Vertcal alignment of icon and secondary action icons or buttons */
  align: PropTypes.oneOf([LEFT, CENTER]),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default TypeBlock;
