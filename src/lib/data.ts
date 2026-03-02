import { Product, BoxShape } from '@/types/product';

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

export const collections = ["Todas", "Floral", "Aniversario", "Cumpleaños", "Especiales"];

export const boxShapes: BoxShape[] = [
    {
        id: 'shape_standard',
        name: 'Caja Estándar',
        type: 'standard',
        defaultDimensions: { width: 4, height: 2, depth: 4 },
        flapsLocation: 'base'
    },
    {
        id: 'shape_lid_base',
        name: 'Caja Tapa y Base',
        type: 'lid-base',
        defaultDimensions: { width: 4, height: 2, depth: 4 },
        flapsLocation: 'base'
    },
    {
        id: 'shape_drawer',
        name: 'Caja tipo Cajón',
        type: 'drawer',
        defaultDimensions: { width: 4, height: 2, depth: 4 },
        flapsLocation: 'base'
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
        dimensions: { width: 4, height: 2, depth: 4 },
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
        dimensions: { width: 4, height: 2, depth: 4 },
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
        dimensions: { width: 4, height: 2, depth: 4 },
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
