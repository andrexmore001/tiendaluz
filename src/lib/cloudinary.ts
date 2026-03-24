/**
 * Utility to optimize Cloudinary URLs by injecting automatic formatting and quality parameters.
 * This helps stay within the free tier by reducing bandwidth usage.
 */
export function getOptimizedUrl(url: string | undefined | null, width?: number): string {
    if (!url) return '';

    // Only optimize Cloudinary URLs
    if (!url.includes('res.cloudinary.com')) return url;

    // Check if it already has transformations
    if (url.includes('/upload/')) {
        const parts = url.split('/upload/');
        const transformations = [`f_auto`, `q_auto`];

        if (width) {
            transformations.push(`w_${width}`, `c_limit`);
        }

        return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
    }

    return url;
}
