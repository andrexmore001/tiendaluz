export interface PriceTier {
    id: string;
    minQty: number;
    maxQty?: number | null;
    unitPrice: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    image: string;      // Base image for cards
    boxTexture: string; // The texture used for the 3D model (top of the box)
    displayMode?: 'photos' | '3d' | 'both';
    images?: {
        url: string;
        isCustomizable?: boolean;
        textConfig?: {
            x: number;      // 0-100%
            y: number;      // 0-100%
            rotation: number; // degrees
            scale: number;    // multiplier
        }
    }[];
    dimensions?: {
        width: number;
        height: number;
        depth: number;
    };
    materialId?: string;
    baseColor?: string;
    priceTiers?: PriceTier[];
}

export interface Collection {
    id: string;
    name: string;
    description: string;
}
