import { Product, BoxShape, Collection } from '@/types/product';

export interface SiteSettings {
    title: string;
    slug: string;
    logo?: string;
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
    heroTitle?: string;
    heroSubtitle?: string;
    heroImages?: string[];
    updatedAt?: string;
}

export let siteSettings: SiteSettings = {
    title: 'Artesana',
    slug: 'artesana',
    logo: '',
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

export const collections: Collection[] = [];

export const boxShapes: BoxShape[] = [];

export let products: Product[] = [];

export const updateSettings = (newSettings: Partial<SiteSettings>) => {
    siteSettings = { ...siteSettings, ...newSettings };
};

export const addProduct = (product: Product) => {
    products.push(product);
};

export const deleteProduct = (id: string) => {
    products = products.filter(p => p.id !== id);
};
