import { useState, useEffect, useRef, RefObject } from 'react';

export interface ScrollAnimationHook {
  isVisible: boolean;
  elementRef: RefObject<HTMLDivElement | null>;
}

export interface UseScrollAnimationOptions {
  threshold?: number | number[];
  root?: Element | Document | null;
  rootMargin?: string;
  once?: boolean;
}

export const useScrollAnimation = ({
  threshold = 0.1,
  root = null,
  rootMargin = '0px',
  once = false,
}: UseScrollAnimationOptions = {}): ScrollAnimationHook => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasBeenVisible = useRef<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (once && hasBeenVisible.current) return;
        
        const isNowVisible = entry.isIntersecting;
        if (isNowVisible) {
          hasBeenVisible.current = true;
        }
        
        setIsVisible(isNowVisible);
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold, root, rootMargin, once]);

  return {
    elementRef,
    isVisible,
  };
};
