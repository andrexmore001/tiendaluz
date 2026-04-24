import { Product, Collection } from '@/types/product';

export interface SiteSettings {
    title: string;
    slug: string;
    logo?: string;
    nequiQr?: string;
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
    chatSyncUrl?: string;
    tickerMessage?: string;
    tickerVisible?: boolean;
    tickerSpeed?: number;
    tickerColor?: string;
    reviews?: string[];
    homepageLayout?: string[];
    wompiEnabled?: boolean;
    updatedAt?: string;
}

export let siteSettings: SiteSettings = {
    title: 'Artesana',
    slug: 'artesana',
    logo: '',
    nequiQr: '',
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
    chatApiKey: '',
    chatSyncUrl: 'https://web-chat-self-beta.vercel.app',
    tickerMessage: '',
    tickerVisible: false,
    tickerSpeed: 30,
    tickerColor: '#E8A2A2',
    reviews: [],
    homepageLayout: ['categories', 'hero', 'split-hero', 'features', 'products'],
    wompiEnabled: false,
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
