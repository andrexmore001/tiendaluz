import { Product, Collection } from '@/types/product';

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
    chatBusinessId?: string;
    chatApiKey?: string;
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
        phone: '3115659523',
        email: 'hola@artesana.com',
        address: 'Bogotá, Colombia',
        instagram: 'artesana.detalles',
        facebook: 'artesana.detalles',
    },
    chatBusinessId: '',
    chatApiKey: ''
};

export const collections: Collection[] = [];



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
