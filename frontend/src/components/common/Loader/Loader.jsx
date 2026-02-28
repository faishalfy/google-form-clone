/**
 * Loader Component
 * 
 * A reusable loading spinner component.
 * 
 * Props:
 * - size: 'small' | 'medium' | 'large'
 * - text: Optional loading text
 * - fullScreen: Center in full screen
 */

import './Loader.css';

const Loader = ({
  size = 'medium',
  text,
  fullScreen = false,
}) => {
  const containerClass = fullScreen ? 'loader-fullscreen' : 'loader-container';

  return (
    <div className={containerClass}>
      <div className={`loader loader-${size}`}></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
