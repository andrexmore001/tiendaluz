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
    
    // 1. Collect unique images from variants
    const variantImages: string[] = [];
    if (product.variants && product.variants.length > 0) {
        product.variants.forEach((v: any) => {
            if (v.image && !variantImages.includes(v.image) && v.image !== product.image) {
                variantImages.push(v.image);
            }
        });
    }

    // Only rotate if there is at least one variant image different from the main one
    if (variantImages.length === 0) {
        return product.image || '';
    }

    // 2. Build full list for rotation (Main + Variants)
    const images = [product.image, ...variantImages].filter(Boolean);

    // 3. Calculate current interval index
    const msInHour = 60 * 60 * 1000;
    const currentInterval = Math.floor(Date.now() / (intervalHours * msInHour));
    
    // 4. Return the image for this interval
    const index = currentInterval % images.length;
    return images[index];
}
