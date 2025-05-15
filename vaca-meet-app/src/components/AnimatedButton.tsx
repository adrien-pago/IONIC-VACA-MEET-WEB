import React, { useState } from 'react';
import { IonButton, IonIcon, IonRippleEffect } from '@ionic/react';
import './AnimatedButton.css';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'default' | 'large';
  expand?: 'block' | 'full';
  icon?: string;
  iconPosition?: 'start' | 'end';
  shape?: 'round';
  fill?: 'solid' | 'outline' | 'clear';
  className?: string;
  loading?: boolean;
  pulse?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  color = 'primary',
  size = 'default',
  expand,
  icon,
  iconPosition = 'start',
  shape,
  fill = 'solid',
  className = '',
  loading = false,
  pulse = false
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handleMouseDown = () => {
    setIsPressed(true);
  };
  
  const handleMouseUp = () => {
    setIsPressed(false);
  };
  
  const buttonClasses = [
    'animated-button',
    `btn-size-${size}`,
    pulse ? 'btn-pulse' : '',
    isPressed ? 'is-pressed' : '',
    loading ? 'is-loading' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <IonButton
      type={type}
      disabled={disabled || loading}
      color={color}
      expand={expand}
      shape={shape}
      fill={fill}
      className={buttonClasses}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      <div className="button-content-wrapper">
        {loading && (
          <div className="button-loader">
            <div className="loader-circle"></div>
          </div>
        )}
        
        <span className={`button-content ${loading ? 'is-loading' : ''}`}>
          {icon && iconPosition === 'start' && (
            <IonIcon icon={icon} className="button-icon button-icon-start" />
          )}
          
          <span>{children}</span>
          
          {icon && iconPosition === 'end' && (
            <IonIcon icon={icon} className="button-icon button-icon-end" />
          )}
        </span>
      </div>
      
      <IonRippleEffect />
    </IonButton>
  );
};

export default AnimatedButton; 