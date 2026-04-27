import { Product } from '@/types/product';

/**
 * Gets the active image for a product based on a time-based rotation interval.
 * @param product The product object
 * @param intervalHours The rotation interval in hours
 * @returns The URL of the image to display
 */
export function getRotatedImage(product: any, intervalHours: number = 3): string {
    if (!product) return '';
    
    // Check if rotation is disabled for this specific product
    if (product.isRotationEnabled === false) {
        return product.image || '';
    }
    
    // 1. Collect all unique images
    const images: string[] = [];
    if (product.image) images.push(product.image);
    
    if (product.variants && product.variants.length > 0) {
        product.variants.forEach((v: any) => {
            if (v.image && !images.includes(v.image)) {
                images.push(v.image);
            }
        });
    }

    if (images.length <= 1) return product.image || '';

    // 2. Calculate current interval index
    // Using Date.now() / (hours in ms)
    const msInHour = 60 * 60 * 1000;
    const currentInterval = Math.floor(Date.now() / (intervalHours * msInHour));
    
    // 3. Return the image for this interval
    const index = currentInterval % images.length;
    return images[index];
}
