export interface PriceTier {
    id: string;
    minQty: number;
    maxQty?: number | null;
    unitPrice: number;
}

export interface AttributeValue {
    id: string;
    value: string;
    attribute: {
        id: string;
        name: string;
    };
}

export interface ProductVariant {
    id: string;
    productId: string;
    sku: string;
    price: number | null;
    stock: number;
    image: string | null;
    isActive: boolean;
    attributes: {
        attributeValue: AttributeValue;
    }[];
}

export interface Product {
    id: string;
    name: string;
    price: number;
    slug?: string;
    description: string;
    collectionId?: string | null;
    supplierId?: string | null;
    costPrice?: number;
    image: string;      // Base image for cards
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
    variants?: ProductVariant[];
    updatedAt?: string;
    createdAt?: string;
    isVisible?: boolean;
    isRotationEnabled?: boolean;
    combineVariantsForTiers?: boolean;
}

export interface Collection {
    id: string;
    name: string;
    slug?: string;
    description: string;
    parentId?: string | null;
    createdAt?: string;
}

export interface Supplier {
    id: string;
    name: string;
    contact?: string | null;
    createdAt?: string;
}
