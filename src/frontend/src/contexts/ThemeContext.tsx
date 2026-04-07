import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = "dark" | "light" | "auto";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: "dark" | "light";
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  resolvedTheme: "dark",
});

// ─── Helper: apply class to <html> ────────────────────────────────────────────

function applyTheme(theme: Theme): "dark" | "light" {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved: "dark" | "light" =
    theme === "auto" ? (prefersDark ? "dark" : "light") : theme;

  const html = document.documentElement;
  if (resolved === "dark") {
    html.classList.add("dark");
    html.classList.remove("light");
    html.style.colorScheme = "dark";
  } else {
    html.classList.add("light");
    html.classList.remove("dark");
    html.style.colorScheme = "light";
  }
  return resolved;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem("nipw-theme");
      if (stored === "dark" || stored === "light" || stored === "auto")
        return stored;
    } catch {
      // ignore
    }
    return "dark";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const mounted = useRef(false);

  // Apply on mount only
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      const resolved = applyTheme(theme);
      setResolvedTheme(resolved);
    }
  });

  // Listen for system preference changes when theme === "auto"
  useEffect(() => {
    if (theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const resolved = applyTheme("auto");
      setResolvedTheme(resolved);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem("nipw-theme", t);
    } catch {
      // ignore
    }
    const resolved = applyTheme(t);
    setResolvedTheme(resolved);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
