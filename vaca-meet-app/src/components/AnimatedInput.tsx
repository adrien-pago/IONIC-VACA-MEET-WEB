import React, { useState } from 'react';
import { IonInput, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';
import './AnimatedInput.css';

interface AnimatedInputProps {
  label: string;
  name: string;
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time';
  value: string;
  onChange: (e: any) => void;
  required?: boolean;
  autoComplete?: 'on' | 'off' | 'name' | 'email' | 'username' | 'current-password' | 'new-password';
  placeholder?: string;
  icon?: string;
  errorMessage?: string;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  autoComplete,
  placeholder,
  icon,
  errorMessage
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== '';
  const hasError = !!errorMessage;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={`animated-input-container ${hasError ? 'has-error' : ''}`}>
      <div className={`
        animated-input-horizontal
        ${isFocused ? 'is-focused' : ''}
        ${hasValue ? 'has-value' : ''}
      `}>
        <div className="input-left-side">
          {icon && (
            <div className={`input-icon ${isFocused ? 'is-focused' : ''}`}>
              <IonIcon icon={icon} />
            </div>
          )}
          
          <div className="input-label">
            <span className={`input-label-text ${isFocused ? 'is-focused' : ''} ${hasValue ? 'has-value' : ''}`}>
              {label}
              {required && <span className="required-mark">*</span>}
            </span>
          </div>
        </div>
        
        <div className="input-right-side">
          <IonInput
            type={type}
            value={value}
            name={name}
            required={required}
            autocomplete={autoComplete}
            placeholder={placeholder || ''}
            onIonChange={onChange}
            onIonFocus={handleFocus}
            onIonBlur={handleBlur}
            className="custom-input"
          />
          
          <div className="focus-line"></div>
        </div>
      </div>
      
      {hasError && (
        <div className="error-message animate-fade-in">
          <IonIcon icon={alertCircleOutline} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default AnimatedInput; 