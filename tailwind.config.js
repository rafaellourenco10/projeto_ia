// Tokens copiados do tailwind.config inline das telas do Stitch (fonte da verdade, ver spec seção 3).
// Os valores ficam em src/main.css (:root = escuro, html.light = claro).
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./*.html', './perfil-rosto/*.html', './src/**/*.js'],
  darkMode: 'class',
  theme: {
    "extend": {
      "colors": {
        // Fixo nos dois temas: escurece foto/vídeo sob texto branco (= surface-container-lowest do escuro).
        "scrim": "rgb(14 13 19 / <alpha-value>)",
        "surface-container-low": "rgb(var(--c-surface-container-low) / <alpha-value>)",
        "on-tertiary": "rgb(var(--c-on-tertiary) / <alpha-value>)",
        "secondary": "rgb(var(--c-secondary) / <alpha-value>)",
        "on-tertiary-fixed": "rgb(var(--c-on-tertiary-fixed) / <alpha-value>)",
        "on-tertiary-container": "rgb(var(--c-on-tertiary-container) / <alpha-value>)",
        "on-secondary": "rgb(var(--c-on-secondary) / <alpha-value>)",
        "inverse-on-surface": "rgb(var(--c-inverse-on-surface) / <alpha-value>)",
        "on-primary-container": "rgb(var(--c-on-primary-container) / <alpha-value>)",
        "surface-dim": "rgb(var(--c-surface-dim) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--c-surface-container-highest) / <alpha-value>)",
        "tertiary": "rgb(var(--c-tertiary) / <alpha-value>)",
        "primary-fixed": "rgb(var(--c-primary-fixed) / <alpha-value>)",
        "tertiary-container": "rgb(var(--c-tertiary-container) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--c-on-secondary-container) / <alpha-value>)",
        "surface": "rgb(var(--c-surface) / <alpha-value>)",
        "on-background": "rgb(var(--c-on-background) / <alpha-value>)",
        "background": "rgb(var(--c-background) / <alpha-value>)",
        "secondary-fixed": "rgb(var(--c-secondary-fixed) / <alpha-value>)",
        "surface-container-high": "rgb(var(--c-surface-container-high) / <alpha-value>)",
        "outline-variant": "rgb(var(--c-outline-variant) / <alpha-value>)",
        "on-primary-fixed": "rgb(var(--c-on-primary-fixed) / <alpha-value>)",
        "inverse-surface": "rgb(var(--c-inverse-surface) / <alpha-value>)",
        "on-primary": "rgb(var(--c-on-primary) / <alpha-value>)",
        "surface-bright": "rgb(var(--c-surface-bright) / <alpha-value>)",
        "surface-container": "rgb(var(--c-surface-container) / <alpha-value>)",
        "secondary-container": "rgb(var(--c-secondary-container) / <alpha-value>)",
        "primary-fixed-dim": "rgb(var(--c-primary-fixed-dim) / <alpha-value>)",
        "on-tertiary-fixed-variant": "rgb(var(--c-on-tertiary-fixed-variant) / <alpha-value>)",
        "primary-container": "rgb(var(--c-primary-container) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--c-surface-container-lowest) / <alpha-value>)",
        "outline": "rgb(var(--c-outline) / <alpha-value>)",
        "on-error-container": "rgb(var(--c-on-error-container) / <alpha-value>)",
        "on-primary-fixed-variant": "rgb(var(--c-on-primary-fixed-variant) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--c-on-surface-variant) / <alpha-value>)",
        "tertiary-fixed": "rgb(var(--c-tertiary-fixed) / <alpha-value>)",
        "surface-variant": "rgb(var(--c-surface-variant) / <alpha-value>)",
        "on-secondary-fixed-variant": "rgb(var(--c-on-secondary-fixed-variant) / <alpha-value>)",
        "secondary-fixed-dim": "rgb(var(--c-secondary-fixed-dim) / <alpha-value>)",
        "on-surface": "rgb(var(--c-on-surface) / <alpha-value>)",
        "error-container": "rgb(var(--c-error-container) / <alpha-value>)",
        "primary": "rgb(var(--c-primary) / <alpha-value>)",
        "inverse-primary": "rgb(var(--c-inverse-primary) / <alpha-value>)",
        "on-secondary-fixed": "rgb(var(--c-on-secondary-fixed) / <alpha-value>)",
        "tertiary-fixed-dim": "rgb(var(--c-tertiary-fixed-dim) / <alpha-value>)",
        "error": "rgb(var(--c-error) / <alpha-value>)",
        "on-error": "rgb(var(--c-on-error) / <alpha-value>)",
        "surface-tint": "rgb(var(--c-surface-tint) / <alpha-value>)"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "space-lg": "1.5rem",
        "space-md": "1rem",
        "gutter-mobile": "1rem",
        "space-xs": "0.25rem",
        "margin": "3rem",
        "space-sm": "0.5rem",
        "margin-mobile": "1.25rem",
        "gutter": "1.5rem",
        "space-xl": "2.5rem"
      },
      "fontFamily": {
        "label-md": [
          "Plus Jakarta Sans"
        ],
        "body-sm": [
          "Plus Jakarta Sans"
        ],
        "headline-md": [
          "Plus Jakarta Sans"
        ],
        "headline-lg-mobile": [
          "Plus Jakarta Sans"
        ],
        "display-hero": [
          "Plus Jakarta Sans"
        ],
        "label-lg": [
          "Plus Jakarta Sans"
        ],
        "headline-sm": [
          "Plus Jakarta Sans"
        ],
        "body-md": [
          "Plus Jakarta Sans"
        ],
        "body-lg": [
          "Plus Jakarta Sans"
        ],
        "display-hero-mobile": [
          "Plus Jakarta Sans"
        ],
        "label-sm": [
          "Plus Jakarta Sans"
        ],
        "headline-lg": [
          "Plus Jakarta Sans"
        ]
      },
      "fontSize": {
        "label-md": [
          "13px",
          {
            "lineHeight": "18px",
            "letterSpacing": "0.015em",
            "fontWeight": "600"
          }
        ],
        "body-sm": [
          "13px",
          {
            "lineHeight": "20px",
            "letterSpacing": "0.005em",
            "fontWeight": "400"
          }
        ],
        "headline-md": [
          "24px",
          {
            "lineHeight": "32px",
            "letterSpacing": "-0.015em",
            "fontWeight": "700"
          }
        ],
        "headline-lg-mobile": [
          "28px",
          {
            "lineHeight": "36px",
            "letterSpacing": "-0.02em",
            "fontWeight": "700"
          }
        ],
        "display-hero": [
          "56px",
          {
            "lineHeight": "64px",
            "letterSpacing": "-0.03em",
            "fontWeight": "800"
          }
        ],
        "label-lg": [
          "15px",
          {
            "lineHeight": "20px",
            "letterSpacing": "0.01em",
            "fontWeight": "600"
          }
        ],
        "headline-sm": [
          "20px",
          {
            "lineHeight": "28px",
            "letterSpacing": "-0.01em",
            "fontWeight": "600"
          }
        ],
        "body-md": [
          "15px",
          {
            "lineHeight": "24px",
            "letterSpacing": "0em",
            "fontWeight": "400"
          }
        ],
        "body-lg": [
          "18px",
          {
            "lineHeight": "28px",
            "letterSpacing": "-0.005em",
            "fontWeight": "400"
          }
        ],
        "display-hero-mobile": [
          "36px",
          {
            "lineHeight": "44px",
            "letterSpacing": "-0.02em",
            "fontWeight": "800"
          }
        ],
        "label-sm": [
          "11px",
          {
            "lineHeight": "14px",
            "letterSpacing": "0.04em",
            "fontWeight": "700"
          }
        ],
        "headline-lg": [
          "40px",
          {
            "lineHeight": "48px",
            "letterSpacing": "-0.025em",
            "fontWeight": "700"
          }
        ]
      }
    }
  },
  plugins: [],
}
