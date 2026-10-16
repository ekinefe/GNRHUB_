import React from 'react';
import { twMerge } from 'tailwind-merge';

// A pulsing placeholder block. Decorative: hidden from screen readers (wrap the list in aria-busy instead).
export function Skeleton({ className = '' }) {
    return <div aria-hidden="true" className={twMerge('animate-pulse bg-cyber-border/40', className)} />;
}

// Placeholder shaped like one catalog card.
export function CardSkeleton() {
    return (
        <div className="border border-cyber-border bg-cyber-black p-6 space-y-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
        </div>
    );
}

export function ListSkeleton({ count = 3 }) {
    return (
        <div role="status" aria-busy="true" aria-label="Loading" className="space-y-6">
            {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
        </div>
    );
}
