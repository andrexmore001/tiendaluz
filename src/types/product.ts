export interface BoxShape {
    id: string;
    name: string;
    type: 'standard' | 'lid-base' | 'drawer';
    defaultDimensions: {
        width: number;
        height: number;
        depth: number;
    };
    hingeEdge?: 'long' | 'short';
    flapsLocation?: 'lid' | 'base';
}

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    image: string;      // Base image for cards
    boxTexture: string; // The texture used for the 3D model (top of the box)
    dimensions?: {
        width: number;
        height: number;
        depth: number;
    };
    boxType?: 'standard' | 'lid-base' | 'drawer';
    materialId?: string;
    baseColor?: string;
    customMaterialTexture?: string; // New field for uploaded material texture
    shapeId?: string; // Linked shape
    hingeEdge?: 'long' | 'short';
    flapsLocation?: 'lid' | 'base';
}
