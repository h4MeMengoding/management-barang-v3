# Dark Mode Implementation Guide

## Color System Overview

### Light Mode (Default)
- **Primary**: `#009966` (Emerald) - Brand color
- **Background**: `#F5F1E8` - Warm cream
- **Surface**: `#FFFFFF` - White cards/surfaces
- **Text Primary**: `#1F2937` - Dark gray

### Dark Mode
- **Primary**: `#5E5CE6` (Purple) - Modern accent
- **Background**: `#1C1C1E` - True dark
- **Surface**: `#2C2C2E` - Elevated surfaces
- **Text Primary**: `#FFFFFF` - White text

## CSS Variables Usage

All colors are now defined as CSS variables in `globals.css`:

```css
/* Light Mode */
:root {
  --color-primary: #009966;
  --body-bg: #F5F1E8;
  --surface-1: #FFFFFF;
  --text-primary: #1F2937;
  /* ... more variables */
}

/* Dark Mode */
:root.dark {
  --color-primary: #5E5CE6;
  --body-bg: #1C1C1E;
  --surface-1: #2C2C2E;
  --text-primary: #FFFFFF;
  /* ... more variables */
}
```

## Component Implementation Examples

### 1. Using Color Tokens in Components

**Before (Hardcoded):**
```tsx
<div className="bg-white text-gray-900">
  <button className="bg-emerald-500 text-white">
    Click me
  </button>
</div>
```

**After (CSS Variables):**
```tsx
<div className="bg-[var(--surface-1)] text-[var(--text-primary)]">
  <button className="bg-[var(--color-primary)] text-white">
    Click me
  </button>
</div>
```

### 2. Card Component
```tsx
export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[var(--surface-1)] rounded-2xl shadow-sm p-5 lg:p-6 ${className}`}>
      {children}
    </div>
  );
}
```

### 3. Button Component Example
```tsx
// Primary Button
<button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-4 py-2 rounded-lg">
  Primary Action
</button>

// Secondary Button
<button className="bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] px-4 py-2 rounded-lg">
  Secondary Action
</button>

// Success Button
<button className="bg-[var(--color-success)] text-white px-4 py-2 rounded-lg">
  Success
</button>

// Danger Button
<button className="bg-[var(--color-danger)] text-white px-4 py-2 rounded-lg">
  Delete
</button>
```

### 4. Input Component Example
```tsx
<input
  type="text"
  className="w-full px-4 py-2 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
  placeholder="Enter text..."
/>
```

### 5. Modal/Dialog Example
```tsx
<div className="fixed inset-0 bg-[var(--overlay)] flex items-center justify-center z-50">
  <div className="bg-[var(--surface-1)] rounded-2xl shadow-lg p-6 max-w-md w-full border border-[var(--border)]">
    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
      Modal Title
    </h2>
    <p className="text-[var(--text-secondary)] mb-6">
      Modal content goes here
    </p>
    <div className="flex gap-3">
      <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg">
        Confirm
      </button>
      <button className="bg-[var(--surface-2)] text-[var(--text-primary)] px-4 py-2 rounded-lg">
        Cancel
      </button>
    </div>
  </div>
</div>
```

### 6. Badge Component Example
```tsx
// Success Badge
<span className="px-3 py-1 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full text-sm font-medium">
  Active
</span>

// Warning Badge
<span className="px-3 py-1 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded-full text-sm font-medium">
  Pending
</span>

// Danger Badge
<span className="px-3 py-1 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-full text-sm font-medium">
  Error
</span>

// Info Badge
<span className="px-3 py-1 bg-[var(--color-info)]/10 text-[var(--color-info)] rounded-full text-sm font-medium">
  Info
</span>
```

### 7. Background Body Example
```tsx
<div className="min-h-screen bg-[var(--body-bg)]">
  {/* Page content */}
</div>
```

## Theme Toggle Usage

### Add Theme Toggle to Your Component

```tsx
import ThemeToggle from '@/components/ThemeToggle';

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* Other sidebar items */}
      <ThemeToggle />
    </div>
  );
}
```

### Programmatic Theme Control

```tsx
'use client';
import { useTheme } from '@/components/ThemeProvider';

export default function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

## Color Token Reference

### Backgrounds
- `var(--body-bg)` - Main body background
- `var(--surface-1)` - Cards, modals, elevated surfaces
- `var(--surface-2)` - Secondary surfaces, hover states
- `var(--surface-3)` - Tertiary surfaces

### Primary Colors
- `var(--color-primary)` - Main brand color (emerald in light, purple in dark)
- `var(--color-primary-light)` - Lighter variant
- `var(--color-primary-dark)` - Darker variant

### Secondary Colors
- `var(--color-secondary)` - Accent color
- `var(--color-secondary-light)` - Lighter variant
- `var(--color-secondary-dark)` - Darker variant

### Semantic Colors
- `var(--color-success)` - Success states, positive actions
- `var(--color-warning)` - Warning states, caution
- `var(--color-danger)` - Error states, destructive actions
- `var(--color-info)` - Informational states

### Text Colors
- `var(--text-primary)` - Primary text, headings
- `var(--text-secondary)` - Secondary text, descriptions
- `var(--text-tertiary)` - Tertiary text, placeholders, disabled
- `var(--text-inverse)` - Inverse text (for overlays)

### Borders & Dividers
- `var(--border)` - Standard borders
- `var(--divider)` - Divider lines

### Overlays & Shadows
- `var(--overlay)` - Modal/dialog backdrop
- `var(--shadow-soft)` - Soft shadow
- `var(--shadow-strong)` - Strong shadow

## Migration Checklist

- [x] CSS variables defined in `globals.css`
- [x] ThemeProvider created and integrated
- [x] ThemeToggle component created
- [x] Layout updated with ThemeProvider
- [x] Card component refactored
- [x] StatCard component refactored
- [ ] Sidebar component - add ThemeToggle button
- [ ] Header component - refactor colors
- [ ] All form inputs - use color tokens
- [ ] All buttons - use color tokens
- [ ] All modals/dialogs - use color tokens
- [ ] All badges - use color tokens

## Notes

1. **Primary Color Switch**: In light mode we use emerald (#009966), in dark mode we use purple (#5E5CE6) for better contrast and modern aesthetics
2. **Smooth Transitions**: Body has `transition: background-color 0.3s ease` for smooth theme switching
3. **System Preference**: Theme respects system dark mode preference by default
4. **Persistence**: Theme choice is saved in localStorage
5. **PWA Support**: Meta theme-color updates dynamically based on theme

## Best Practices

1. Always use CSS variable tokens, never hardcode colors
2. Test components in both light and dark modes
3. Ensure sufficient contrast ratios (WCAG AA minimum)
4. Use semantic colors appropriately (success, warning, danger, info)
5. Leverage opacity for softer variants: `bg-[var(--color-primary)]/10`
