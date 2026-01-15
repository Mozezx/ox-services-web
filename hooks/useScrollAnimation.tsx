import { useEffect, useRef, useState } from 'react';
import React from 'react';

interface UseScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
    const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
    const elementRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref: elementRef, isVisible };
};

// Animation wrapper component
interface AnimatedSectionProps {
    children: React.ReactNode;
    animation?: 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'fade-in' | 'scale-in';
    delay?: number;
    className?: string;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
    children,
    animation = 'fade-in-up',
    delay = 0,
    className = ''
}) => {
    const { ref, isVisible } = useScrollAnimation();

    const animationClass = isVisible ? `animate-${animation}` : 'animate-on-scroll';
    const delayClass = delay > 0 ? `delay-${delay}` : '';

    return (
        <div ref={ref} className={`${animationClass} ${delayClass} ${className}`.trim()}>
            {children}
        </div>
    );
};

export default useScrollAnimation;
