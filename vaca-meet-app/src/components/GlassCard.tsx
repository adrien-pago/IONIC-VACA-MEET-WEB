import React, { useState } from 'react';
import { IonCard, IonCardContent } from '@ionic/react';
import './GlassCard.css';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  color?: 'primary' | 'secondary' | 'tertiary' | 'light' | 'medium' | 'dark';
  interactive?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  mode?: 'ios' | 'md';
  animated?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  color = 'light',
  interactive = false,
  clickable = false,
  onClick,
  mode,
  animated = true
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handleMouseDown = () => {
    if (interactive || clickable) {
      setIsPressed(true);
    }
  };
  
  const handleMouseUp = () => {
    if (interactive || clickable) {
      setIsPressed(false);
    }
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  
  const cardClasses = [
    'glass-card',
    `glass-card-${color}`,
    interactive ? 'interactive' : '',
    clickable ? 'clickable' : '',
    isPressed ? 'is-pressed' : '',
    animated ? 'animated' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <IonCard
      className={cardClasses}
      mode={mode}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      button={clickable}
    >
      <div className="glass-card-backdrop"></div>
      <div className="glass-card-content-wrapper">
        <IonCardContent className="glass-card-content">
          {children}
        </IonCardContent>
      </div>
      
      {interactive && (
        <div className="glass-card-overlay">
          <div className="glass-card-highlight"></div>
        </div>
      )}
    </IonCard>
  );
};

export default GlassCard; 