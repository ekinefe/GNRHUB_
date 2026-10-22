// Turns a title into a URL-safe slug: lower case, letters and digits joined by single hyphens.
// Accents are folded (ş to s, é to e) and the Turkish dotless i becomes i. Shared by the blog editor and the API.
export function slugify(text, max = 80) {
    const folded = String(text ?? '')
        .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ß/g, 'ss').replace(/ł/g, 'l').replace(/Ł/g, 'l')
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();
    return folded.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max).replace(/-+$/g, '');
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
