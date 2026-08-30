---
name: Academic Wealth
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf4'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dde9ff'
  surface-container-highest: '#d5e3fd'
  on-surface: '#0d1c2f'
  on-surface-variant: '#45464d'
  inverse-surface: '#233144'
  inverse-on-surface: '#ebf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#e0e3e5'
  on-secondary-container: '#626567'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e0e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f8f9ff'
  on-background: '#0d1c2f'
  surface-variant: '#d5e3fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  section-title:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  card-title:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-reading:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-standard:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  sidebar-width: 280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1280px
---

## Brand & Style
The design system is rooted in the intersection of traditional academic rigor and modern financial technology. The personality is authoritative yet accessible, designed to evoke a sense of calm intelligence and disciplined growth.

The visual style follows a **Modern Corporate** aesthetic with a lean toward **Minimalism**. It prioritizes high information density without clutter, utilizing significant whitespace to ensure focus during long-form study sessions. Every design decision serves the clarity of the data and the quality of the educational content.

## Colors
The palette is engineered for professional trust and prolonged reading comfort.

- **Primary (Deep Navy):** Used for structural elements like sidebar navigation, headers, and primary action buttons to establish authority.
- **Secondary (Crisp White/Slate 50):** The primary background color to maintain a clean, "paper-like" academic feel.
- **Accent (Emerald Green):** Reserved exclusively for positive financial indicators, progress tracking, and success states to reinforce the "growth" narrative.
- **Text (Dark Slate):** Provides high-contrast legibility for body copy while being softer on the eyes than pure black.

## Typography
This design system uses a systematic implementation of **Inter** to maintain a clean, utilitarian feel. 

Hierarchy is established through weight and scale. For "Long-form Reading," a specific `body-reading` token is used with an increased line height (1.6x) and font size (18px) to prevent eye strain during complex financial material study. Labels and metadata should use `label-sm` with medium weights to differentiate them from core narrative text.

## Layout & Spacing
The layout uses a **Fluid Grid** with fixed constraints for maximum readability.

- **Desktop (1200px+):** A 12-column grid. The main layout features a fixed 280px sidebar on the left with a 3-column content area for course cards and material.
- **Tablet (768px - 1199px):** Sidebar collapses into a drawer or icon-only rail. Content reflows into a 2-column grid.
- **Mobile (< 767px):** Single-column stack. Margins are reduced to 16px to maximize horizontal space for tables and charts.

Video content must adhere to a strict **16:9 aspect ratio** container to ensure instructional clarity across all devices.

## Elevation & Depth
To maintain an academic and clean aesthetic, depth is communicated through **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Background):** Secondary color (#F8FAFC).
- **Level 1 (Cards/Surface):** Pure White (#FFFFFF) with a 1px border of #E2E8F0.
- **Interaction Depth:** Only active cards or hovered elements receive a soft, diffused shadow (0px 4px 20px rgba(15, 23, 42, 0.05)). This avoids the "heavy" look of traditional shadows while providing enough feedback for interactivity.

## Shapes
This design system utilizes a **Soft** shape language. 

Standard components like input fields, buttons, and material cards use a 0.25rem (4px) corner radius. Large containers or featured content blocks may use `rounded-lg` (8px). This subtle rounding retains a professional, structured look while appearing modern and approachable compared to sharp-edged institutional software.

## Components

- **Material Cards:** White surfaces with a subtle 1px Slate-200 border. Thumbnails at the top should maintain a 16:9 ratio. Card titles use `card-title` typography with a maximum of two lines.
- **Professional Buttons:**
  - *Primary:* Solid Deep Navy Blue with white text.
  - *Secondary:* Ghost style with Slate-700 text and Slate-200 border.
  - *Accent:* Used for "Complete Lesson" or "Invest Now" actions in Emerald Green.
- **Form Inputs:** Clean, minimal fields with 1px Slate-200 borders. On focus, the border transitions to Deep Navy with a subtle 2px outer glow.
- **Breadcrumbs:** Small-scale `label-sm` links separated by a forward slash (/). The current page is always bolded in Deep Navy.
- **Video Player:** Integrated 16:9 container with controls styled in semi-transparent Deep Navy.
- **Data Tables:** Row-based layouts with alternating subtle gray highlights and no vertical borders to emphasize horizontal readability.