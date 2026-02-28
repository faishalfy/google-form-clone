/**
 * Card Component
 * 
 * A reusable card container component.
 * 
 * Props:
 * - children: Card content
 * - title: Optional card title
 * - className: Additional CSS classes
 * - onClick: Optional click handler (makes card clickable)
 */

import './Card.css';

const Card = ({
  children,
  title,
  className = '',
  onClick,
  ...rest
}) => {
  const isClickable = !!onClick;
  
  return (
    <div
      className={`card ${isClickable ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick() : undefined}
      {...rest}
    >
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">{children}</div>
    </div>
  );
};

export default Card;
