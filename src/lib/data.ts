import { Product, BoxShape, Collection } from '@/types/product';

export interface SiteSettings {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
    };
    contact: {
        phone: string;
        email: string;
        address: string;
        instagram: string;
        facebook: string;
    };
}

export let siteSettings: SiteSettings = {
    colors: {
        primary: '#E8A2A2',
        secondary: '#F9F1E7',
        accent: '#D4AF37',
        background: '#FFFFFF',
    },
    contact: {
        phone: '+57 311 565 9523',
        email: 'hola@artesana.com',
        address: 'Bogotá, Colombia',
        instagram: 'artesana.detalles',
        facebook: 'artesana.detalles',
    }
};

export const collections: Collection[] = [
    { id: '1', name: "Todas", description: "Todos los productos del catálogo" },
    { id: '2', name: "Floral", description: "Diseños inspirados en la naturaleza y flores" },
    { id: '3', name: "Aniversario", description: "Cajas especiales para celebrar el amor" },
    { id: '4', name: "Cumpleaños", description: "Detalles vibrantes para un día inolvidable" },
    { id: '5', name: "Especiales", description: "Ediciones limitadas y pedidos únicos" }
];

export const boxShapes: BoxShape[] = [
    {
        id: 'shape_standard',
        name: 'Caja Estándar',
        type: 'standard',
        defaultDimensions: { width: 4, height: 2, depth: 4 },
        flapsLocation: 'base',
        flapHeightPercent: 0.25,
        flapWidthOffset: -0.2,
        flapType: 'rectangular'
    },
    {
        id: 'shape_lid_base',
        name: 'Caja Tapa y Base',
        type: 'lid-base',
        defaultDimensions: { width: 4, height: 2, depth: 4 },
        flapsLocation: 'base',
        flapHeightPercent: 0.25,
        flapWidthOffset: -0.2,
        flapType: 'rectangular'
    },
    {
        id: 'shape_drawer',
        name: 'Caja tipo Cajón',
        type: 'drawer',
        defaultDimensions: { width: 4, height: 2, depth: 4 },
        flapsLocation: 'base',
        flapHeightPercent: 0.25,
        flapWidthOffset: -0.2,
        flapType: 'rectangular'
    }
];

export let products: Product[] = [
    {
        id: 'prod_primavera',
        name: 'Caja Artesana Primavera',
        price: 85000,
        category: 'Floral',
        description: 'Una caja llena de vida y color para celebrar momentos especiales.',
        image: '/hero-banner.png',
        boxTexture: '/box-placeholder.png',
        displayMode: '3d',
        images: [],
        dimensions: { width: 30, height: 20, depth: 30 },
        boxType: 'standard',
        shapeId: 'shape_standard'
    },
    {
        id: 'prod_gold',
        name: 'Caja Aniversario Gold',
        price: 120000,
        category: 'Aniversario',
        description: 'Elegancia y distinción en cada detalle para celebrar el amor.',
        image: '/hero-banner.png',
        boxTexture: '/box-placeholder.png',
        displayMode: '3d',
        images: [],
        dimensions: { width: 30, height: 20, depth: 30 },
        boxType: 'lid-base',
        shapeId: 'shape_lid_base'
    },
    {
        id: 'prod_azul',
        name: 'Caja Fiesta Azul',
        price: 95000,
        category: 'Cumpleaños',
        description: 'Sorpresas vibrantes para un día inolvidable.',
        image: '/hero-banner.png',
        boxTexture: '/box-placeholder.png',
        displayMode: '3d',
        images: [],
        dimensions: { width: 30, height: 20, depth: 30 },
        boxType: 'drawer',
        shapeId: 'shape_drawer'
    }
];

export const updateSettings = (newSettings: Partial<SiteSettings>) => {
    siteSettings = { ...siteSettings, ...newSettings };
};

export const addProduct = (product: Product) => {
    products.push(product);
};

export const deleteProduct = (id: string) => {
    products = products.filter(p => p.id !== id);
};
