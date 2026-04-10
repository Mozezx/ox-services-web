/**
 * Scroll Animation Script
 * Adds entrance animations to elements when they scroll into view
 */

(function () {
    'use strict';

    // Elements to animate with their animation types
    const animationConfig = [
        // Hero section
        { selector: '.hero-content h1, [data-translate*="heroTitle"]', animation: 'fade-in-up' },
        { selector: '.hero-content p, [data-translate*="heroSubtitle"], [data-translate*="description"]', animation: 'fade-in-up', delay: 100 },
        { selector: '.hero-content a, .hero-content button', animation: 'fade-in-up', delay: 200 },

        // Section headers
        { selector: 'section h2', animation: 'fade-in-up' },
        { selector: 'section h2 + div, section h2 + p', animation: 'fade-in-up', delay: 100 },

        // Feature cards
        { selector: '.grid > div', animation: 'fade-in-up', stagger: true },

        // Images
        { selector: 'section img, .rounded-xl > img', animation: 'scale-in' },

        // Footer columns
        { selector: 'footer > div > div > div', animation: 'fade-in-up', stagger: true }
    ];

    // CSS classes for animations
    const animationClasses = {
        'fade-in-up': 'animate-fade-in-up',
        'fade-in-down': 'animate-fade-in-down',
        'fade-in-left': 'animate-fade-in-left',
        'fade-in-right': 'animate-fade-in-right',
        'fade-in': 'animate-fade-in',
        'scale-in': 'animate-scale-in'
    };

    const delayClasses = {
        100: 'delay-100',
        200: 'delay-200',
        300: 'delay-300',
        400: 'delay-400',
        500: 'delay-500',
        600: 'delay-600',
        700: 'delay-700',
        800: 'delay-800'
    };

    // Initialize elements
    function prepareElements() {
        animationConfig.forEach(config => {
            const elements = document.querySelectorAll(config.selector);

            elements.forEach((el, index) => {
                // Add base class (hidden state)
                el.classList.add('animate-on-scroll');

                // Store animation type
                el.dataset.animationType = config.animation;

                // Handle delay
                if (config.stagger) {
                    el.dataset.animationDelay = (index + 1) * 100;
                } else if (config.delay) {
                    el.dataset.animationDelay = config.delay;
                }
            });
        });
    }

    // Intersection Observer callback
    function handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const animationType = el.dataset.animationType || 'fade-in-up';
                const delay = el.dataset.animationDelay;

                // Apply animation class
                el.classList.remove('animate-on-scroll');
                el.classList.add(animationClasses[animationType]);

                // Apply delay if specified
                if (delay && delayClasses[delay]) {
                    el.classList.add(delayClasses[delay]);
                } else if (delay) {
                    el.style.animationDelay = delay + 'ms';
                }

                // Stop observing
                observer.unobserve(el);
            }
        });
    }

    // Create observer
    function createObserver() {
        const options = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        return new IntersectionObserver(handleIntersection, options);
    }

    // Initialize
    function init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setup);
        } else {
            setup();
        }
    }

    function setup() {
        prepareElements();

        const observer = createObserver();

        // Observe all prepared elements
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    init();
})();
