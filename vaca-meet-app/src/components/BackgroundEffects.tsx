import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import './BackgroundEffects.css';

interface BackgroundEffectsProps {
  variant?: 'purple' | 'blue' | 'gradient' | 'green' | 'minimal';
  density?: 'low' | 'medium' | 'high';
  animate?: boolean;
  useThemeColors?: boolean;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ 
  variant = 'purple', 
  density = 'medium',
  animate = true,
  useThemeColors = true
}) => {
  const { currentTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Map theme types to variant colors
  const getThemeVariant = (): 'purple' | 'blue' | 'gradient' | 'green' | 'minimal' => {
    if (!useThemeColors) return variant;
    
    switch(currentTheme) {
      case 'blue': return 'blue';
      case 'green': return 'green';
      case 'minimal': return 'minimal';
      case 'default':
      default: return variant === 'gradient' ? 'gradient' : 'purple';
    }
  };
  
  const activeVariant = getThemeVariant();
  
  useEffect(() => {
    if (!canvasRef.current || !animate) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: Particle[] = [];
    let animationFrameId: number;
    
    // Configuration
    const particleCount = density === 'low' ? 15 : density === 'medium' ? 30 : 50;
    const baseColor = getBaseColor(activeVariant);
    const particleSize = { min: 2, max: 6 };
    const particleSpeed = { min: 0.1, max: 0.3 };
    
    // Classes et fonctions utilitaires
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * (particleSize.max - particleSize.min) + particleSize.min;
        this.speedX = (Math.random() - 0.5) * particleSpeed.max;
        this.speedY = (Math.random() - 0.5) * particleSpeed.max;
        this.color = getParticleColor(baseColor);
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > width) this.x = 0;
        else if (this.x < 0) this.x = width;
        
        if (this.y > height) this.y = 0;
        else if (this.y < 0) this.y = height;
      }
      
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    function getBaseColor(variant: string): string {
      switch(variant) {
        case 'blue': return '#4285F4';
        case 'green': return '#27AE60';
        case 'minimal': return '#888888';
        case 'gradient': return '#6C63FF';
        case 'purple':
        default: return '#6C63FF';
      }
    }
    
    function getParticleColor(baseColor: string): string {
      const colors = {
        '#6C63FF': ['rgba(108, 99, 255, 0.5)', 'rgba(108, 99, 255, 0.3)', 'rgba(147, 126, 255, 0.4)'],
        '#4285F4': ['rgba(66, 133, 244, 0.5)', 'rgba(66, 133, 244, 0.3)', 'rgba(100, 160, 255, 0.4)'],
        '#27AE60': ['rgba(39, 174, 96, 0.5)', 'rgba(39, 174, 96, 0.3)', 'rgba(111, 207, 151, 0.4)'],
        '#888888': ['rgba(136, 136, 136, 0.3)', 'rgba(136, 136, 136, 0.2)', 'rgba(170, 170, 170, 0.25)'],
      };
      
      // @ts-ignore
      const colorOptions = colors[baseColor] || colors['#6C63FF'];
      return colorOptions[Math.floor(Math.random() * colorOptions.length)];
    }
    
    function init() {
      canvas.width = width;
      canvas.height = height;
      particles = [];
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }
    
    function animate() {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw connections with color based on variant
      let strokeColor;
      switch(activeVariant) {
        case 'blue': strokeColor = 'rgba(66, 133, 244, 0.15)'; break;
        case 'green': strokeColor = 'rgba(39, 174, 96, 0.15)'; break;
        case 'minimal': strokeColor = 'rgba(136, 136, 136, 0.1)'; break;
        case 'purple':
        case 'gradient':
        default: strokeColor = 'rgba(108, 99, 255, 0.15)';
      }
      
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            const opacity = 1 - (distance / 120);
            ctx.globalAlpha = opacity * 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      ctx.globalAlpha = 1;
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      init();
    };
    
    window.addEventListener('resize', handleResize);
    init();
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [animate, density, activeVariant]);
  
  return (
    <div className={`background-effects background-${activeVariant}`}>
      {animate ? (
        <canvas ref={canvasRef} className="particles-canvas" />
      ) : null}
      <div className="gradient-overlay"></div>
      <div className="background-blur"></div>
    </div>
  );
};

export default BackgroundEffects; 