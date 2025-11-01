// hooks/useOptimizedNavigation.js
import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function useOptimizedNavigation() {
    const router = useRouter();
    const navigationTimeoutRef = useRef(null);
    const pendingNavigationRef = useRef(null);

    const optimizedNavigate = useCallback((href, options = {}) => {
        // Clear any pending navigation
        if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
        }

        // If there's already a pending navigation to the same route, ignore
        if (pendingNavigationRef.current === href) {
            return;
        }

        pendingNavigationRef.current = href;

        // Use immediate navigation without artificial delays
        router.push(href, options);

        // Small delay to handle rapid clicks
        navigationTimeoutRef.current = setTimeout(() => {
            pendingNavigationRef.current = null;
        }, 100);
    }, [router]);

    const prefetch = useCallback((href) => {
        router.prefetch(href);
    }, [router]);

    return {
        optimizedNavigate,
        prefetch
    };
}