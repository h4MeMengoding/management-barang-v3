# Dark Mode - Common UI Patterns

## Complete Component Examples

### 1. Button Variants

```tsx
// Primary Button
<button className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg font-medium transition-colors">
  Primary Action
</button>

// Secondary Button
<button className="px-4 py-2 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] rounded-lg font-medium transition-colors">
  Secondary Action
</button>

// Outline Button
<button className="px-4 py-2 bg-transparent border-2 border-[var(--border)] hover:border-[var(--color-primary)] text-[var(--text-primary)] rounded-lg font-medium transition-colors">
  Outline Button
</button>

// Ghost Button
<button className="px-4 py-2 bg-transparent hover:bg-[var(--surface-2)] text-[var(--text-primary)] rounded-lg font-medium transition-colors">
  Ghost Button
</button>

// Success Button
<button className="px-4 py-2 bg-[var(--color-success)] hover:opacity-90 text-white rounded-lg font-medium transition-opacity">
  Success Action
</button>

// Danger Button
<button className="px-4 py-2 bg-[var(--color-danger)] hover:opacity-90 text-white rounded-lg font-medium transition-opacity">
  Delete
</button>

// Disabled Button
<button disabled className="px-4 py-2 bg-[var(--surface-2)] text-[var(--text-tertiary)] rounded-lg font-medium cursor-not-allowed opacity-50">
  Disabled
</button>
```

### 2. Form Inputs

```tsx
// Text Input
<div className="space-y-2">
  <label className="block text-sm font-medium text-[var(--text-primary)]">
    Email Address
  </label>
  <input
    type="email"
    placeholder="name@example.com"
    className="w-full px-4 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-colors"
  />
</div>

// Textarea
<textarea
  rows={4}
  placeholder="Enter description..."
  className="w-full px-4 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-colors resize-none"
/>

// Select Dropdown
<select className="w-full px-4 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-colors">
  <option value="">Select option</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</select>

// Checkbox
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    className="w-4 h-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/50"
  />
  <span className="text-sm text-[var(--text-primary)]">Remember me</span>
</label>

// Radio Button
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="radio"
    name="option"
    className="w-4 h-4 border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/50"
  />
  <span className="text-sm text-[var(--text-primary)]">Option A</span>
</label>
```

### 3. Card Variants

```tsx
// Basic Card
<div className="bg-[var(--surface-1)] rounded-2xl shadow-sm p-6">
  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
    Card Title
  </h3>
  <p className="text-[var(--text-secondary)]">
    Card description goes here
  </p>
</div>

// Card with Border
<div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-6">
  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
    Bordered Card
  </h3>
  <p className="text-[var(--text-secondary)]">
    Card with visible border
  </p>
</div>

// Hoverable Card
<div className="bg-[var(--surface-1)] rounded-2xl shadow-sm p-6 hover:shadow-md hover:bg-[var(--surface-2)] transition-all cursor-pointer">
  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
    Interactive Card
  </h3>
  <p className="text-[var(--text-secondary)]">
    Hover to see effect
  </p>
</div>

// Highlighted Card
<div className="bg-[var(--surface-1)] border-2 border-[var(--color-primary)] rounded-2xl p-6">
  <h3 className="text-lg font-bold text-[var(--color-primary)] mb-2">
    Featured Card
  </h3>
  <p className="text-[var(--text-secondary)]">
    Card with primary border
  </p>
</div>
```

### 4. Badges & Tags

```tsx
// Primary Badge
<span className="inline-flex items-center px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full text-sm font-medium">
  Primary
</span>

// Success Badge
<span className="inline-flex items-center px-3 py-1 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full text-sm font-medium">
  Active
</span>

// Warning Badge
<span className="inline-flex items-center px-3 py-1 bg-[var(--color-warning)]/10 text-[var(--color-warning)] rounded-full text-sm font-medium">
  Pending
</span>

// Danger Badge
<span className="inline-flex items-center px-3 py-1 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-full text-sm font-medium">
  Error
</span>

// Info Badge
<span className="inline-flex items-center px-3 py-1 bg-[var(--color-info)]/10 text-[var(--color-info)] rounded-full text-sm font-medium">
  Info
</span>

// Neutral Badge
<span className="inline-flex items-center px-3 py-1 bg-[var(--surface-2)] text-[var(--text-secondary)] rounded-full text-sm font-medium">
  Neutral
</span>

// Badge with Dot
<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-full text-sm font-medium">
  <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
  Online
</span>
```

### 5. Alerts & Notifications

```tsx
// Success Alert
<div className="flex items-start gap-3 p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 rounded-lg">
  <div className="w-5 h-5 rounded-full bg-[var(--color-success)] flex items-center justify-center flex-shrink-0">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
  <div className="flex-1">
    <h4 className="font-semibold text-[var(--color-success)] mb-1">Success!</h4>
    <p className="text-sm text-[var(--text-primary)]">Your changes have been saved successfully.</p>
  </div>
</div>

// Warning Alert
<div className="flex items-start gap-3 p-4 bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-lg">
  <div className="w-5 h-5 rounded-full bg-[var(--color-warning)] flex items-center justify-center flex-shrink-0">
    <span className="text-white font-bold text-xs">!</span>
  </div>
  <div className="flex-1">
    <h4 className="font-semibold text-[var(--color-warning)] mb-1">Warning</h4>
    <p className="text-sm text-[var(--text-primary)]">Please review the information before proceeding.</p>
  </div>
</div>

// Danger Alert
<div className="flex items-start gap-3 p-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 rounded-lg">
  <div className="w-5 h-5 rounded-full bg-[var(--color-danger)] flex items-center justify-center flex-shrink-0">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
      <path d="M3 3L9 9M9 3L3 9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </div>
  <div className="flex-1">
    <h4 className="font-semibold text-[var(--color-danger)] mb-1">Error</h4>
    <p className="text-sm text-[var(--text-primary)]">Something went wrong. Please try again.</p>
  </div>
</div>

// Info Alert
<div className="flex items-start gap-3 p-4 bg-[var(--color-info)]/10 border border-[var(--color-info)]/20 rounded-lg">
  <div className="w-5 h-5 rounded-full bg-[var(--color-info)] flex items-center justify-center flex-shrink-0">
    <span className="text-white font-bold text-xs">i</span>
  </div>
  <div className="flex-1">
    <h4 className="font-semibold text-[var(--color-info)] mb-1">Info</h4>
    <p className="text-sm text-[var(--text-primary)]">Here's some useful information for you.</p>
  </div>
</div>
```

### 6. Modal / Dialog

```tsx
// Modal Overlay + Content
<div className="fixed inset-0 bg-[var(--overlay)] flex items-center justify-center z-50 p-4">
  <div className="bg-[var(--surface-1)] rounded-2xl shadow-2xl max-w-md w-full border border-[var(--border)] overflow-hidden">
    {/* Modal Header */}
    <div className="flex items-center justify-between p-6 border-b border-[var(--divider)]">
      <h2 className="text-xl font-bold text-[var(--text-primary)]">
        Modal Title
      </h2>
      <button className="w-8 h-8 rounded-lg hover:bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </div>

    {/* Modal Body */}
    <div className="p-6">
      <p className="text-[var(--text-secondary)] mb-4">
        This is the modal content. You can put any content here.
      </p>
      
      {/* Form Example */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
          />
        </div>
      </div>
    </div>

    {/* Modal Footer */}
    <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--divider)] bg-[var(--surface-2)]">
      <button className="px-4 py-2 bg-[var(--surface-1)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] rounded-lg font-medium transition-colors">
        Cancel
      </button>
      <button className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg font-medium transition-colors">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### 7. List Items

```tsx
// Simple List Item
<div className="flex items-center gap-3 p-4 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-2)] transition-colors cursor-pointer">
  <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
    <Package size={20} className="text-[var(--color-primary)]" />
  </div>
  <div className="flex-1 min-w-0">
    <h4 className="font-medium text-[var(--text-primary)] truncate">Item Name</h4>
    <p className="text-sm text-[var(--text-secondary)]">Description text</p>
  </div>
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="flex-shrink-0 text-[var(--text-tertiary)]">
    <path d="M8 6L12 10L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</div>

// List Item with Badge
<div className="flex items-center gap-3 p-4 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg">
  <div className="flex-1">
    <div className="flex items-center gap-2 mb-1">
      <h4 className="font-medium text-[var(--text-primary)]">Item Name</h4>
      <span className="px-2 py-0.5 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded text-xs font-medium">
        New
      </span>
    </div>
    <p className="text-sm text-[var(--text-secondary)]">Description text</p>
  </div>
</div>
```

### 8. Dividers

```tsx
// Horizontal Divider
<hr className="border-t border-[var(--divider)] my-6" />

// Divider with Text
<div className="flex items-center gap-4 my-6">
  <hr className="flex-1 border-t border-[var(--divider)]" />
  <span className="text-sm text-[var(--text-tertiary)] font-medium">OR</span>
  <hr className="flex-1 border-t border-[var(--divider)]" />
</div>

// Vertical Divider
<div className="h-8 w-px bg-[var(--divider)]" />
```

### 9. Loading States

```tsx
// Skeleton Card
<div className="bg-[var(--surface-1)] rounded-2xl p-6 animate-pulse">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-12 h-12 bg-[var(--surface-2)] rounded-lg" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-[var(--surface-2)] rounded w-3/4" />
      <div className="h-3 bg-[var(--surface-2)] rounded w-1/2" />
    </div>
  </div>
  <div className="space-y-2">
    <div className="h-3 bg-[var(--surface-2)] rounded" />
    <div className="h-3 bg-[var(--surface-2)] rounded w-5/6" />
  </div>
</div>

// Loading Spinner
<div className="flex items-center justify-center p-8">
  <div className="w-8 h-8 border-3 border-[var(--border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
</div>
```

### 10. Empty States

```tsx
<div className="flex flex-col items-center justify-center p-12 text-center">
  <div className="w-16 h-16 rounded-full bg-[var(--surface-2)] flex items-center justify-center mb-4">
    <Package size={32} className="text-[var(--text-tertiary)]" />
  </div>
  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
    No items found
  </h3>
  <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
    Get started by creating your first item
  </p>
  <button className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg font-medium transition-colors">
    Create Item
  </button>
</div>
```

## Quick Tips

1. **Always use opacity for soft backgrounds**: `bg-[var(--color-primary)]/10`
2. **Focus rings should be semi-transparent**: `focus:ring-[var(--color-primary)]/50`
3. **Hover states**: Use `hover:bg-[var(--surface-2)]` for subtle effects
4. **Transitions**: Add `transition-colors` or `transition-all` for smooth theme switching
5. **Test both themes**: Always check light AND dark mode after styling

## Color Consistency Rules

- Primary buttons → `bg-[var(--color-primary)]`
- Secondary buttons → `bg-[var(--surface-2)]`
- Backgrounds → `bg-[var(--surface-1)]`
- Borders → `border-[var(--border)]`
- Headings → `text-[var(--text-primary)]`
- Body text → `text-[var(--text-secondary)]`
- Placeholders → `text-[var(--text-tertiary)]`
