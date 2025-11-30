/**
 * View Transitions API Utility
 * Provides smooth page transitions with fallback for unsupported browsers
 */

export function supportsViewTransitions(): boolean {
  if (typeof document === 'undefined') return false;
  return 'startViewTransition' in document;
}

interface ViewTransitionOptions {
  onTransitionReady?: () => void;
  onTransitionComplete?: () => void;
  onTransitionError?: (error: Error) => void;
}

export function startViewTransition(
  updateCallback: () => void | Promise<void>,
  options: ViewTransitionOptions = {}
): void {
  const { onTransitionReady, onTransitionComplete, onTransitionError } = options;

  // Check if View Transitions API is supported
  if (!supportsViewTransitions() || !(document as any).startViewTransition) {
    // Fallback: just run the update without transition
    try {
      const result = updateCallback();
      if (result instanceof Promise) {
        result
          .then(() => onTransitionComplete?.())
          .catch((error) => onTransitionError?.(error));
      } else {
        onTransitionComplete?.();
      }
    } catch (error) {
      onTransitionError?.(error as Error);
    }
    return;
  }

  // Use View Transitions API
  try {
    const transition = (document as any).startViewTransition(async () => {
      await updateCallback();
    });

    // Handle transition lifecycle
    if (onTransitionReady) {
      transition.ready.then(onTransitionReady).catch((error: Error) => {
        console.warn('View transition ready failed:', error);
      });
    }

    if (onTransitionComplete || onTransitionError) {
      transition.finished
        .then(() => onTransitionComplete?.())
        .catch((error: Error) => {
          console.warn('View transition finished with error:', error);
          onTransitionError?.(error);
        });
    }
  } catch (error) {
    console.error('View transition error:', error);
    onTransitionError?.(error as Error);
    // Fallback to direct update
    updateCallback();
  }
}

/**
 * Skip the current view transition
 * Useful when you want to update immediately without animation
 */
export function skipViewTransition(): void {
  if (typeof document !== 'undefined' && (document as any).startViewTransition) {
    const transition = (document as any).startViewTransition(() => {});
    transition.skipTransition();
  }
}
