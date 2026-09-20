"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const storageKey = "playground-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);
const listeners = new Set<() => void>();

const notifyThemeListeners = () => {
  listeners.forEach((listener) => listener());
};

const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem(storageKey);

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getServerTheme = (): Theme => "light";

const subscribeToTheme = (listener: () => void) => {
  listeners.add(listener);

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) {
      listener();
    }
  };
  const handleSystemThemeChange = () => {
    if (!window.localStorage.getItem(storageKey)) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);
  mediaQuery.addEventListener("change", handleSystemThemeChange);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
    mediaQuery.removeEventListener("change", handleSystemThemeChange);
  };
};

const setStoredTheme = (theme: Theme) => {
  window.localStorage.setItem(storageKey, theme);
  notifyThemeListeners();
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getPreferredTheme,
    getServerTheme,
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setStoredTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
