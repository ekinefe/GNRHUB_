import { ACCESS } from '@/modules/auth/access';

// One entry per product/feature module. `access` is the lowest level allowed to use it.
// Adding a product = a folder in modules/ + an entry here (+ functions/modules/<key>/ if it has a backend).
export const modules = [
    { key: 'brandbook', label: 'Brandbook Maker', path: '/tools/brandbook', access: ACCESS.GUEST },
];

export const moduleByKey = (key) => modules.find((m) => m.key === key);
