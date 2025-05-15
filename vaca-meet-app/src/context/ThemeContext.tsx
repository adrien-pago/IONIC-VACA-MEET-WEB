import React, { createContext, useState, useEffect, useContext } from 'react';

// Types de thèmes disponibles
export type ThemeType = 'default' | 'blue' | 'green' | 'minimal';

interface ThemeContextType {
  currentTheme: ThemeType;
  changeTheme: (theme: ThemeType) => void;
  isThemeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'default',
  changeTheme: () => {},
  isThemeLoaded: false
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('default');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    // Charger le thème depuis le localStorage au démarrage
    const savedTheme = localStorage.getItem('vacaMeetTheme') as ThemeType;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
    setIsThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!isThemeLoaded) return;

    // Appliquer la classe de thème au body
    document.body.classList.remove('theme-default', 'theme-blue', 'theme-green', 'theme-minimal');
    
    if (currentTheme === 'default') {
      document.body.classList.add('theme-default');
    } else {
      document.body.classList.add(`theme-${currentTheme}`);
    }

    // Sauvegarder le thème dans localStorage
    localStorage.setItem('vacaMeetTheme', currentTheme);
  }, [currentTheme, isThemeLoaded]);

  const changeTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, isThemeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personnalisé pour utiliser le thème
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 