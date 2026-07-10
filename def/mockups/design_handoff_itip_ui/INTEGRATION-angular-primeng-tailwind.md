# Integration — Angular + PrimeNG + Tailwind

The ITIP design system is framework-agnostic, but the app stack (Angular + **PrimeNG** + **Tailwind**)
does affect *how* you enforce it. The tokens in `tokens/itip-tokens.css` remain the single source of
truth; PrimeNG and Tailwind must both be wired to consume them. Do this before building screens.

## 1. CSS variables are the bridge
Import `tokens/itip-tokens.css` at the app root. Every token is a CSS custom property, and the dark
theme is `[data-theme="dark"]`. Both Tailwind and the PrimeNG preset reference these variables, so a
single `data-theme` flip re-themes everything. Do NOT duplicate hex values into three places — point
Tailwind and PrimeNG at the vars.

## 2. Tailwind (low risk — it's the utility layer)
Map tokens into `tailwind.config`, referencing the CSS vars so dark mode follows automatically:

```js
// tailwind.config.js
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary:      'var(--itip-primary)',
        'primary-hover':'var(--itip-primary-hover)',
        surface:      'var(--itip-surface)',
        bg:           'var(--itip-bg)',
        text:         'var(--itip-text)',
        muted:        'var(--itip-text-muted)',
        border:       'var(--itip-border)',
        // lifecycle + compliance …
      },
      fontFamily: { sans: ["'Hanken Grotesk'", 'system-ui', 'sans-serif'], mono: ["'JetBrains Mono'",'monospace'] },
      borderRadius: { card: 'var(--itip-card-radius)', input: '9px', modal: '16px' },
      boxShadow: { card: 'var(--itip-shadow-card)', 'card-hover': 'var(--itip-shadow-card-hover)', modal: 'var(--itip-shadow-modal)' },
    },
  },
};
```

- **Layer order:** load order should be Tailwind `base` → PrimeNG theme → Tailwind `utilities`
  (so utilities can override component styles). If using `@layer`, register PrimeNG in a layer *below*
  `utilities`. In PrimeNG v18 use `cssLayer` in the theme config to make this deterministic:
  `theme: { options: { cssLayer: { name: 'primeng', order: 'tailwind-base, primeng, tailwind-utilities' } } }`.
- Tailwind Preflight is fine; if it fights a PrimeNG base style, the layer order above resolves it.

## 3. PrimeNG (the part that actually matters)
PrimeNG ships its own theming. Pick ONE approach and make it conform:

### Recommended: styled mode + a custom ITIP preset
Define a preset (via `@primeng/themes` `definePreset`, based on Aura) that maps PrimeNG's semantic tokens
to ITIP values, then bind its dark selector to ours:

```ts
providePrimeNG({
  theme: {
    preset: ItipPreset,               // primary.* = indigo scale; surface, content, etc.
    options: {
      darkModeSelector: '[data-theme="dark"]',   // ALIGN with our dark theme
      cssLayer: { name: 'primeng', order: 'tailwind-base, primeng, tailwind-utilities' },
    },
  },
});
```

In the preset, set at minimum:
- `primary` palette → indigo (500/600/700 around `#6366F1`/`#4F46E5`/`#4338CA`)
- surface scale → `#FFFFFF` / `#F5F6F8` / borders `#E6E8EC`/`#EEF0F3`; dark scale → `#141B2D`/`#0A0F1C`/`#2A3450`
- `borderRadius` → 9px (controls/inputs), focus ring → 3px indigo `rgba(79,70,229,.12)`
- font family → Hanken Grotesk

### Component mapping (preset + per-component `pt` pass-through where needed)
| ITIP spec | PrimeNG component | Notes |
|---|---|---|
| Buttons (primary/secondary) | `p-button` | `severity`/`outlined`; primary = indigo, secondary = surface+`#D3D8E0` border |
| Inputs / textarea / selects | `p-inputtext`, `p-select`, `p-textarea` | 9px radius, `#D3D8E0` border, indigo focus ring |
| Lifecycle / status badges | `p-tag` | map severities to lifecycle colors; solid fills unchanged in dark |
| Chips (frameworks, filters) | `p-chip` | indigo-tint `#EEF2FF`/`#DFE3FF`/`#4338CA`; removable |
| Tables | `p-table` | header bg `#FAFBFC`, uppercase 700/10.5 muted, hairline dividers, hover `#F5F6F8`; sort + paginator |
| Modal / confirm | `p-dialog` / `confirmdialog` | 440px, radius 16, scrim `rgba(15,23,42,.45)`, focus trap built in |
| Info banner (IAM) | `p-message` | indigo-tint styling |
| Progress bars (findings/compliance) | `p-progressbar` or plain div | track `#EEF0F3`, fill = compliance color |
| Charts | prefer **ngx-charts**/D3 over `p-chart` | match the curve/donut spec exactly |
| Diagram | NOT a PrimeNG widget | custom (React Flow analog: `@swimlane/ngx-graph` or D3+ELK) per the alignment technique |

The **cards** (`.itip-stat` / `.itip-panel`), **app shell/sidebar**, **auth split-screen**, and the
**diagram** are NOT PrimeNG components — build them as plain Angular components styled with tokens +
Tailwind. Use PrimeNG for the interactive widgets inside them.

### Icons
The DS specifies **Lucide** (`lucide-angular`). PrimeNG defaults to **PrimeIcons**. Choose: keep Lucide
for app chrome (nav, header, page content) — recommended for consistency — and either restyle PrimeNG
widgets to use Lucide, or accept PrimeIcons only inside PrimeNG-internal affordances (dropdown carets,
paginator arrows). Don’t mix two icon languages in the same visual area.

## 4. Dark mode — one switch
Toggle `data-theme="dark"` on `<html>`. That drives: our token vars, Tailwind (`darkMode` selector),
and PrimeNG (`darkModeSelector`). Verify every PrimeNG widget in both themes — overlays (dropdown
panels, dialogs) render in a portal at `<body>`, so confirm the attribute is on an ancestor that covers
the portal (put it on `<html>`, not a nested div).

## TL;DR
- Tokens (CSS vars) = source of truth; Tailwind + PrimeNG both point at them.
- Tailwind: map tokens in config, `darkMode:['selector','[data-theme="dark"]']`, set `cssLayer` order.
- PrimeNG: custom preset mapping primary→indigo + surfaces + radius + focus; `darkModeSelector:'[data-theme="dark"]'`; map components per the table; charts via ngx-charts; icons stay Lucide.
- Result: PrimeNG widgets and Tailwind utilities both render 100% in the ITIP system, light and dark.
