import React, { useState, useEffect, useRef } from 'react';
import type { Stat } from '../types';

interface StatsProps {
    stats: Stat[];
}

const AnimatedCounter = ({ value, duration = 2000 }: { value: string, duration?: number }) => {
    const [displayValue, setDisplayValue] = useState("0");
    const [suffix, setSuffix] = useState("");
    const [prefix, setPrefix] = useState("");
    const elementRef = useRef<HTMLSpanElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Parse value on mount
    const targetValue = useRef(0);

    useEffect(() => {
        const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(\D*)$/);
        if (match) {
            setPrefix(match[1]);
            targetValue.current = parseFloat(match[2]);
            setSuffix(match[3]);
        } else {
            setDisplayValue(value);
        }
    }, [value]);

    // Intersection Observer to detect visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (targetValue.current === 0 && !value.match(/\d/)) return;
        if (!isVisible) return;

        const animate = () => {
            let startTimestamp: number | null = null;
            const start = 0;
            const end = targetValue.current;

            const step = (timestamp: number) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);

                // Ease out expo
                const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

                const current = Math.floor(start + (end - start) * ease);

                setDisplayValue(current.toString());

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    setDisplayValue(end.toString());
                }
            };
            requestAnimationFrame(step);
        };

        // Initial animation when becomes visible
        animate();

        // Loop every 6 seconds
        const interval = setInterval(() => {
            animate();
        }, 6000);

        return () => clearInterval(interval);
    }, [duration, value, isVisible]);

    if (!value.match(/\d/)) return <span ref={elementRef}>{value}</span>;

    return <span ref={elementRef}>{prefix}{displayValue}{suffix}</span>;
};

const Stats: React.FC<StatsProps> = ({ stats }) => {
    return (
        <section className="w-full flex justify-center py-10 px-4 md:px-10 bg-background-light dark:bg-background-dark">
            <div className="w-full max-w-[1280px]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col gap-2 p-4 md:p-6 border-l-2 border-primary/20 dark:border-white/20">
                            <p className="text-primary dark:text-white text-4xl font-bold font-display tracking-tight">
                                <AnimatedCounter value={stat.value} />
                            </p>
                            <p className="text-primary/70 dark:text-white/70 text-sm font-medium uppercase tracking-wide font-body">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
