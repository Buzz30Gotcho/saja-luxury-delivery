import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialiser le thème au montage
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    // On force 'light' par défaut si rien n'est stocké, au lieu de regarder prefers-color-scheme
    const initialTheme = storedTheme || "light";
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setIsLoaded(true);
  }, []);

  // Appliquer le thème au DOM
  const applyTheme = (themeValue) => {
    const root = document.documentElement;
    if (themeValue === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // Basculer entre light et dark
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Définir le thème directement
  const setCurrentTheme = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setCurrentTheme, isLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};
