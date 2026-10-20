// Tokens copiados do tailwind.config inline das telas do Stitch (fonte da verdade, ver spec seção 3).
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./*.html', './perfil-rosto/*.html', './src/**/*.js'],
  darkMode: 'class',
  theme: {
    "extend": {
      "colors": {
        "surface-container-low": "#1c1b21",
        "on-tertiary": "#003640",
        "secondary": "#ffb0cd",
        "on-tertiary-fixed": "#001f26",
        "on-tertiary-container": "#002f38",
        "on-secondary": "#640039",
        "inverse-on-surface": "#312f36",
        "on-primary-container": "#340080",
        "surface-dim": "#141319",
        "surface-container-highest": "#35343b",
        "tertiary": "#4cd7f6",
        "primary-fixed": "#e9ddff",
        "tertiary-container": "#009eb9",
        "on-secondary-container": "#ffbad3",
        "surface": "#141319",
        "on-background": "#e5e1ea",
        "background": "#141319",
        "secondary-fixed": "#ffd9e4",
        "surface-container-high": "#2b2930",
        "outline-variant": "#494454",
        "on-primary-fixed": "#23005c",
        "inverse-surface": "#e5e1ea",
        "on-primary": "#3c0091",
        "surface-bright": "#3a383f",
        "surface-container": "#201f25",
        "secondary-container": "#aa0266",
        "primary-fixed-dim": "#d0bcff",
        "on-tertiary-fixed-variant": "#004e5c",
        "primary-container": "#a078ff",
        "surface-container-lowest": "#0e0d13",
        "outline": "#958ea0",
        "on-error-container": "#ffdad6",
        "on-primary-fixed-variant": "#5516be",
        "on-surface-variant": "#cbc3d7",
        "tertiary-fixed": "#acedff",
        "surface-variant": "#35343b",
        "on-secondary-fixed-variant": "#8c0053",
        "secondary-fixed-dim": "#ffb0cd",
        "on-surface": "#e5e1ea",
        "error-container": "#93000a",
        "primary": "#d0bcff",
        "inverse-primary": "#6d3bd7",
        "on-secondary-fixed": "#3e0022",
        "tertiary-fixed-dim": "#4cd7f6",
        "error": "#ffb4ab",
        "on-error": "#690005",
        "surface-tint": "#d0bcff"
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
