import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedEffects } from '@/shared/config/effects';

// A list whose items fade and slide in one after another and fade out when a filter removes them, and the rest glide into
// their new place (GNR-54). One effect for one kind of component: list items.
//
//   items       array to render
//   getKey      (item) => stable key
//   renderItem  (item) => the content of the <li>
//
// The longest any single animation runs is DURATION (0.25 s) plus the stagger of the first STAGGER_CAP items, so the whole
// thing stays under the 400 ms budget. With reduced effects (OS setting or footer switch) it is a plain list: no motion.
export const DURATION = 0.25;
export const STAGGER = 0.03;
export const STAGGER_CAP = 4;

export default function AnimatedList({ items, getKey, renderItem, className = '' }) {
    const reduced = useReducedEffects();
    if (reduced) {
        return <ul className={className}>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;
    }
    return (
        <ul className={className}>
            <AnimatePresence initial={false} mode="popLayout">
                {items.map((item, i) => (
                    <motion.li
                        key={getKey(item)}
                        layout="position"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: DURATION, delay: Math.min(i, STAGGER_CAP) * STAGGER } }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        transition={{ duration: DURATION }}
                    >
                        {renderItem(item)}
                    </motion.li>
                ))}
            </AnimatePresence>
        </ul>
    );
}
