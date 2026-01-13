
import React from 'react';
import type { Stat } from '../types';

interface StatsProps {
    stats: Stat[];
}

const Stats: React.FC<StatsProps> = ({ stats }) => {
    return (
        <section className="w-full flex justify-center py-10 px-4 md:px-10 bg-background-light dark:bg-background-dark">
            <div className="w-full max-w-[1280px]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col gap-2 p-4 md:p-6 border-l-2 border-primary/20 dark:border-white/20">
                            <p className="text-primary dark:text-white text-4xl font-bold font-display tracking-tight">{stat.value}</p>
                            <p className="text-primary/70 dark:text-white/70 text-sm font-medium uppercase tracking-wide font-body">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
