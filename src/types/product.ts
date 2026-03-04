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
    // New geometric fields for flaps
    flapHeightPercent?: number;  // Default: 0.25 (25% of the related side)
    flapWidthOffset?: number;   // Default: -0.2 (Reduction from the edge in cm)
    flapType?: 'rectangular' | 'trapezoidal'; // Default: rectangular
    tuckFlapHeightPercent?: number; // Height of the tuck flap (0-1)
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
    boxType?: 'standard' | 'lid-base' | 'drawer';
    materialId?: string;
    baseColor?: string;
    customMaterialTexture?: string; // New field for uploaded material texture
    shapeId?: string; // Linked shape
    hingeEdge?: 'long' | 'short';
    flapsLocation?: 'lid' | 'base';
    // Mirrored geometric fields for flaps in Product
    flapHeightPercent?: number;
    flapWidthOffset?: number;
    flapType?: 'rectangular' | 'trapezoidal';
    tuckFlapHeightPercent?: number;
}

export interface Collection {
    id: string;
    name: string;
    description: string;
}
