// The donut maths (a torus lit from one side), kept apart from the React component.
const LUMINANCE = '.,-~:;=!*#$@';
const WIDTH = 58;
const HEIGHT = 26;

/** One frame of the donut for rotation angles A (around x) and B (around z): HEIGHT lines of WIDTH characters. */
export function donutFrame(A, B, width = WIDTH, height = HEIGHT) {
    const output = new Array(width * height).fill(' ');
    const zbuffer = new Array(width * height).fill(0);
    const cosA = Math.cos(A), sinA = Math.sin(A), cosB = Math.cos(B), sinB = Math.sin(B);
    const R1 = 1, R2 = 2, K2 = 5;
    const K1 = (width * K2 * 3) / (8 * (R1 + R2));

    for (let theta = 0; theta < 6.283; theta += 0.07) {
        const cosT = Math.cos(theta), sinT = Math.sin(theta);
        for (let phi = 0; phi < 6.283; phi += 0.03) {
            const cosP = Math.cos(phi), sinP = Math.sin(phi);
            const circleX = R2 + R1 * cosT;
            const circleY = R1 * sinT;
            const x = circleX * (cosB * cosP + sinA * sinB * sinP) - circleY * cosA * sinB;
            const y = circleX * (sinB * cosP - sinA * cosB * sinP) + circleY * cosA * cosB;
            const z = K2 + cosA * circleX * sinP + circleY * sinA;
            const ooz = 1 / z;
            const xp = Math.floor(width / 2 + K1 * ooz * x);
            const yp = Math.floor(height / 2 - K1 * ooz * y * 0.5);
            const L = cosP * cosT * sinB - cosA * cosT * sinP - sinA * sinT + cosB * (cosA * sinT - cosT * sinA * sinP);
            if (L > 0 && xp >= 0 && xp < width && yp >= 0 && yp < height) {
                const idx = xp + yp * width;
                if (ooz > zbuffer[idx]) {
                    zbuffer[idx] = ooz;
                    output[idx] = LUMINANCE[Math.min(LUMINANCE.length - 1, Math.floor(L * 8))];
                }
            }
        }
    }
    const lines = [];
    for (let row = 0; row < height; row += 1) lines.push(output.slice(row * width, (row + 1) * width).join(''));
    return lines.join('\n');
}
