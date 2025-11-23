# Quick Refactor Guide - Header Component

## Step-by-Step untuk Refactor Header.tsx

### 1. Search Button & Input (Mobile)
**Find:**
```tsx
className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
```

**Replace with:**
```tsx
className="w-10 h-10 rounded-full bg-[var(--surface-1)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors flex-shrink-0"
```

### 2. Search Icon Color
**Find:**
```tsx
<Search size={20} className="text-gray-700" />
```

**Replace with:**
```tsx
<Search size={20} className="text-[var(--text-primary)]" />
```

### 3. Profile Button (Mobile & Desktop)
**Find:**
```tsx
className="w-10 h-10 rounded-full bg-emerald-500 overflow-hidden hover:ring-2 hover:ring-emerald-400 transition-all"
```

**Replace with:**
```tsx
className="w-10 h-10 rounded-full bg-[var(--color-primary)] overflow-hidden hover:ring-2 hover:ring-[var(--color-primary-light)] transition-all"
```

### 4. Profile Dropdown Menu
**Find:**
```tsx
className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
```

**Replace with:**
```tsx
className="absolute top-12 right-0 w-48 bg-[var(--surface-1)] rounded-xl shadow-lg border border-[var(--border)] py-2 z-50"
```

### 5. Menu Items in Dropdown
**Find:**
```tsx
className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-gray-700"
```

**Replace with:**
```tsx
className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-2)] transition-colors text-[var(--text-primary)]"
```

### 6. Logout Button
**Find:**
```tsx
className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-red-600"
```

**Replace with:**
```tsx
className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-2)] transition-colors text-[var(--color-danger)]"
```

### 7. Page Title (Mobile)
**Find:**
```tsx
<h1 className="text-xl font-bold text-gray-900 flex-1 min-w-0 truncate tracking-tight">
```

**Replace with:**
```tsx
<h1 className="text-xl font-bold text-[var(--text-primary)] flex-1 min-w-0 truncate tracking-tight">
```

### 8. Search Input (Mobile Expandable)
**Find:**
```tsx
className="w-full pl-4 pr-12 py-3 rounded-full bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-300"
```

**Replace with:**
```tsx
className="w-full pl-4 pr-12 py-3 rounded-full bg-[var(--surface-1)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
```

### 9. Search Button (Black Circle)
**Find:**
```tsx
className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
```

**Replace with:**
```tsx
className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white hover:bg-[var(--color-primary-dark)] transition-colors"
```

### 10. Search Results Dropdown
**Find:**
```tsx
<div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
```

**Replace with:**
```tsx
<div className="absolute top-full mt-2 left-0 right-0 bg-[var(--surface-1)] rounded-xl shadow-lg border border-[var(--border)] py-2 z-50 max-h-96 overflow-y-auto">
```

### 11. "No Results" Text
**Find:**
```tsx
<div className="px-4 py-8 text-center text-gray-500 text-sm">
```

**Replace with:**
```tsx
<div className="px-4 py-8 text-center text-[var(--text-secondary)] text-sm">
```

### 12. Section Headers in Search Results
**Find:**
```tsx
<div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Barang</div>
```

**Replace with:**
```tsx
<div className="px-4 py-2 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Barang</div>
```

### 13. Search Result Items (Hover State)
**Find:**
```tsx
className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-default"
```

**Replace with:**
```tsx
className="px-4 py-3 hover:bg-[var(--surface-2)] transition-colors cursor-default"
```

### 14. Item Icon Backgrounds (Different Colors)
**Find:**
```tsx
<div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
  <Package size={16} className="text-emerald-600" />
</div>
```

**Replace with:**
```tsx
<div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
  <Package size={16} className="text-[var(--color-primary)]" />
</div>
```

**For different semantic colors:**
```tsx
{/* Locker - Info color */}
<div className="w-8 h-8 rounded-lg bg-[var(--color-info)]/10 flex items-center justify-center flex-shrink-0">
  <Archive size={16} className="text-[var(--color-info)]" />
</div>

{/* Category - Secondary color */}
<div className="w-8 h-8 rounded-lg bg-[var(--color-secondary)]/10 flex items-center justify-center flex-shrink-0">
  <FolderTree size={16} className="text-[var(--color-secondary)]" />
</div>
```

### 15. Result Item Text
**Find:**
```tsx
<p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
<p className="text-xs text-gray-500">{item.locker.code} - {item.locker.name}</p>
```

**Replace with:**
```tsx
<p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
<p className="text-xs text-[var(--text-secondary)]">{item.locker.code} - {item.locker.name}</p>
```

### 16. Desktop Heading
**Find:**
```tsx
<h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
```

**Replace with:**
```tsx
<h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
```

### 17. Desktop Description
**Find:**
```tsx
<p className="text-sm lg:text-base text-gray-500 mt-1">
```

**Replace with:**
```tsx
<p className="text-sm lg:text-base text-[var(--text-secondary)] mt-1">
```

### 18. Desktop Search Input
**Find:**
```tsx
className="w-64 xl:w-80 pl-4 pr-12 py-2.5 lg:py-3 rounded-full bg-white border border-gray-200 text-sm lg:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-300"
```

**Replace with:**
```tsx
className="w-64 xl:w-80 pl-4 pr-12 py-2.5 lg:py-3 rounded-full bg-[var(--surface-1)] border border-[var(--border)] text-sm lg:text-base text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
```

## Color Pattern Summary

| Old Class | New Class | Usage |
|-----------|-----------|-------|
| `bg-white` | `bg-[var(--surface-1)]` | Cards, modals, inputs |
| `bg-gray-50` | `bg-[var(--surface-2)]` | Hover states |
| `bg-gray-100` | `bg-[var(--surface-2)]` | Secondary backgrounds |
| `bg-gray-900` | `bg-[var(--color-primary)]` | Primary buttons (use primary!) |
| `bg-emerald-500` | `bg-[var(--color-primary)]` | Primary colors |
| `bg-emerald-100` | `bg-[var(--color-primary)]/10` | Soft primary backgrounds |
| `text-gray-900` | `text-[var(--text-primary)]` | Primary text |
| `text-gray-700` | `text-[var(--text-primary)]` | Primary text |
| `text-gray-600` | `text-[var(--text-secondary)]` | Secondary text |
| `text-gray-500` | `text-[var(--text-secondary)]` | Secondary text |
| `text-gray-400` | `text-[var(--text-tertiary)]` | Tertiary/disabled text |
| `text-emerald-600` | `text-[var(--color-primary)]` | Primary text color |
| `text-red-600` | `text-[var(--color-danger)]` | Danger/error text |
| `border-gray-200` | `border-[var(--border)]` | Borders |
| `ring-emerald-300` | `ring-[var(--color-primary)]/50` | Focus rings |
| `hover:bg-gray-50` | `hover:bg-[var(--surface-2)]` | Hover states |
| `hover:bg-gray-800` | `hover:bg-[var(--color-primary-dark)]` | Button hovers |

## Testing Checklist

After refactoring, test:
- [ ] Light mode - All elements visible and readable
- [ ] Dark mode - All elements visible and readable
- [ ] Search functionality works
- [ ] Dropdown menus readable
- [ ] Hover states visible
- [ ] Focus states visible
- [ ] Icons have proper contrast
- [ ] Text is readable (check contrast ratio)

## Pro Tips

1. Use `/10` opacity for soft backgrounds: `bg-[var(--color-primary)]/10`
2. Use `/50` opacity for focus rings: `ring-[var(--color-primary)]/50`
3. Replace ALL `bg-gray-900` with `bg-[var(--color-primary)]` for consistency
4. Test in both modes after each major change
5. Use browser DevTools to toggle `.dark` class for quick testing
