"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import { ThemeProvider, useTheme } from "@/components/theme/theme-context";

const BackIcon = () => (
  <svg
    aria-hidden="true"
    className="size-5"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const SunIcon = () => (
  <svg
    aria-hidden="true"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    aria-hidden="true"
    className="size-4"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M20.99 12.77A8.5 8.5 0 1 1 11.23 3a6.5 6.5 0 0 0 9.76 9.77Z" />
  </svg>
);

const DefaultNav = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isHome = pathname === "/";
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 text-zinc-950 dark:text-white sm:px-6"
    >
      <div>
        {!isHome ? (
          <Link
            aria-label="Back to home"
            className="pointer-events-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-white/55 px-2 text-sm font-semibold shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_8px_24px_rgba(0,0,0,0.08)] outline-none ring-1 ring-black/10 transition-[background-color,box-shadow,opacity,transform] duration-150 hover:bg-white/75 active:scale-[0.96] dark:bg-white/10 dark:shadow-[0_1px_0_rgba(255,255,255,0.10)_inset,0_8px_24px_rgba(0,0,0,0.18)] dark:ring-white/12 dark:hover:bg-white/16 sm:px-3"
            href="/"
          >
            <BackIcon />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
        ) : null}
      </div>

      <button
        aria-label={`Switch to ${nextTheme} theme`}
        className="pointer-events-auto grid size-10 place-items-center rounded-full bg-white/55 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_8px_24px_rgba(0,0,0,0.08)] outline-none ring-1 ring-black/10 transition-[background-color,box-shadow,transform] duration-150 hover:bg-white/75 active:scale-[0.96] dark:bg-white/10 dark:shadow-[0_1px_0_rgba(255,255,255,0.10)_inset,0_8px_24px_rgba(0,0,0,0.18)] dark:ring-white/12 dark:hover:bg-white/16"
        onClick={toggleTheme}
        title={`Switch to ${nextTheme} theme`}
        type="button"
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </nav>
  );
};

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <body className="h-dvh w-dvw bg-background text-foreground">
      <ThemeProvider>
        <DefaultNav />
        <div className="h-full w-full">{children}</div>
        <footer></footer>
      </ThemeProvider>
    </body>
  );
};

export default AppLayout;
