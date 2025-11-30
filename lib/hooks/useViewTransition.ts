'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { startViewTransition } from '@/lib/view-transitions';

interface UseViewTransitionOptions {
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useViewTransition(options: UseViewTransitionOptions = {}) {
  const router = useRouter();

  const navigate = useCallback(
    (url: string) => {
      options.onStart?.();

      startViewTransition(
        () => {
          router.push(url);
        },
        {
          onTransitionComplete: options.onComplete,
          onTransitionError: options.onError,
        }
      );
    },
    [router, options]
  );

  const replace = useCallback(
    (url: string) => {
      options.onStart?.();

      startViewTransition(
        () => {
          router.replace(url);
        },
        {
          onTransitionComplete: options.onComplete,
          onTransitionError: options.onError,
        }
      );
    },
    [router, options]
  );

  const back = useCallback(() => {
    options.onStart?.();

    startViewTransition(
      () => {
        router.back();
      },
      {
        onTransitionComplete: options.onComplete,
        onTransitionError: options.onError,
      }
    );
  }, [router, options]);

  const forward = useCallback(() => {
    options.onStart?.();

    startViewTransition(
      () => {
        router.forward();
      },
      {
        onTransitionComplete: options.onComplete,
        onTransitionError: options.onError,
      }
    );
  }, [router, options]);

  return {
    navigate,
    replace,
    back,
    forward,
  };
}
