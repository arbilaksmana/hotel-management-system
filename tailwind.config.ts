import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        tone: {
          positive: {
            DEFAULT: "hsl(var(--tone-positive-bg))",
            foreground: "hsl(var(--tone-positive-fg))",
            border: "hsl(var(--tone-positive-border))",
            cell: "hsl(var(--tone-positive-cell))",
          },
          info: {
            DEFAULT: "hsl(var(--tone-info-bg))",
            foreground: "hsl(var(--tone-info-fg))",
            border: "hsl(var(--tone-info-border))",
            cell: "hsl(var(--tone-info-cell))",
          },
          warning: {
            DEFAULT: "hsl(var(--tone-warning-bg))",
            foreground: "hsl(var(--tone-warning-fg))",
            border: "hsl(var(--tone-warning-border))",
            cell: "hsl(var(--tone-warning-cell))",
          },
          committed: {
            DEFAULT: "hsl(var(--tone-committed-bg))",
            foreground: "hsl(var(--tone-committed-fg))",
            border: "hsl(var(--tone-committed-border))",
            cell: "hsl(var(--tone-committed-cell))",
          },
          danger: {
            DEFAULT: "hsl(var(--tone-danger-bg))",
            foreground: "hsl(var(--tone-danger-fg))",
            border: "hsl(var(--tone-danger-border))",
            cell: "hsl(var(--tone-danger-cell))",
          },
          special: {
            DEFAULT: "hsl(var(--tone-special-bg))",
            foreground: "hsl(var(--tone-special-fg))",
            border: "hsl(var(--tone-special-border))",
            cell: "hsl(var(--tone-special-cell))",
          },
          inspect: {
            DEFAULT: "hsl(var(--tone-inspect-bg))",
            foreground: "hsl(var(--tone-inspect-fg))",
            border: "hsl(var(--tone-inspect-border))",
            cell: "hsl(var(--tone-inspect-cell))",
          },
          attention: {
            DEFAULT: "hsl(var(--tone-attention-bg))",
            foreground: "hsl(var(--tone-attention-fg))",
            border: "hsl(var(--tone-attention-border))",
            cell: "hsl(var(--tone-attention-cell))",
          },
          neutral: {
            DEFAULT: "hsl(var(--tone-neutral-bg))",
            foreground: "hsl(var(--tone-neutral-fg))",
            border: "hsl(var(--tone-neutral-border))",
            cell: "hsl(var(--tone-neutral-cell))",
          },
          inverse: {
            DEFAULT: "hsl(var(--tone-inverse-bg))",
            foreground: "hsl(var(--tone-inverse-fg))",
            border: "hsl(var(--tone-inverse-border))",
            cell: "hsl(var(--tone-inverse-cell))",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseSoft: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".55" } },
      },
      animation: {
        "fade-in": "fade-in .2s ease-out",
        "slide-up": "slide-up .22s ease-out",
        "pulse-soft": "pulseSoft 1.6s ease-in-out infinite",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
