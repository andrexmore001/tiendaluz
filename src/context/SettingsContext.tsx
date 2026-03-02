"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, siteSettings as initialSettings, products as initialProducts, collections as initialCollections } from '@/lib/data';
import { Product } from '@/types/product';

export interface Material {
    id: string;
    name: string;
    textureUrl: string;
    roughness?: number;
    metalness?: number;
}

interface SettingsContextType {
    settings: SiteSettings;
    products: Product[];
    collections: string[];
    isAuthenticated: boolean;
    updateSettings: (newSettings: Partial<SiteSettings>) => void;
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    addCollection: (name: string) => void;
    deleteCollection: (name: string) => void;
    materials: Material[];
    login: (password: string) => boolean;
    logout: () => void;
    storageError: string | null;
    clearAllData: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(initialSettings);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [collections, setCollections] = useState<string[]>(initialCollections);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [storageError, setStorageError] = useState<string | null>(null);

    const materials: Material[] = [
        { id: 'carton-kraft', name: 'Cartón Kraft', textureUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1000' },
        { id: 'madera-clara', name: 'Madera Clara', textureUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1000' },
        { id: 'terciopelo-negro', name: 'Terciopelo Negro', textureUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1000' },
        { id: 'cuero-blanco', name: 'Cuero Blanco', textureUrl: 'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?q=80&w=1000' }
    ];

    // Initial load from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('artesana_settings');
        const savedProducts = localStorage.getItem('artesana_products');
        const savedCollections = localStorage.getItem('artesana_collections');
        const savedAuth = localStorage.getItem('is_admin_auth');

        if (savedSettings) setSettings(JSON.parse(savedSettings));
        if (savedProducts) {
            const parsedProducts: Product[] = JSON.parse(savedProducts);

            // 1. Start with initial products from code
            const finalProducts = [...initialProducts];

            // 2. Overwrite or add products from localStorage
            parsedProducts.forEach(savedP => {
                const index = finalProducts.findIndex(p => p.id === savedP.id);
                if (index !== -1) {
                    // Update existing product with saved state, but keep new defaults for missing fields
                    finalProducts[index] = { ...finalProducts[index], ...savedP };
                } else {
                    // Add new product created by user
                    finalProducts.push(savedP);
                }
            });

            setProducts(finalProducts);
        }
        if (savedCollections) setCollections(JSON.parse(savedCollections));
        if (savedAuth === 'true') setIsAuthenticated(true);

        // SYNC ACROSS TABS
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'artesana_products' && e.newValue) {
                setProducts(JSON.parse(e.newValue));
            }
            if (e.key === 'artesana_settings' && e.newValue) {
                setSettings(JSON.parse(e.newValue));
            }
            if (e.key === 'artesana_collections' && e.newValue) {
                setCollections(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        setIsLoaded(true);

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Save to localStorage whenever state changes
    useEffect(() => {
        if (!isLoaded) return;
        try {
            localStorage.setItem('artesana_settings', JSON.stringify(settings));
            localStorage.setItem('artesana_products', JSON.stringify(products));
            localStorage.setItem('artesana_collections', JSON.stringify(collections));
            localStorage.setItem('is_admin_auth', isAuthenticated.toString());
            setStorageError(null);
        } catch (e) {
            console.error("Storage limit reached", e);
            setStorageError("El espacio de almacenamiento está lleno. Borra productos o usa fotos más ligeras.");
        }
    }, [settings, products, collections, isAuthenticated, isLoaded]);

    // Apply CSS variables to the document root whenever settings change
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary', settings.colors.primary);
        root.style.setProperty('--primary-light', `${settings.colors.primary}15`);
        root.style.setProperty('--secondary', settings.colors.secondary);
        root.style.setProperty('--accent', settings.colors.accent);
        root.style.setProperty('--background', settings.colors.background);
    }, [settings]);

    const updateSettings = (newSettings: Partial<SiteSettings>) => {
        setSettings(prev => ({
            ...prev,
            ...newSettings,
            colors: { ...prev.colors, ...newSettings.colors },
            contact: { ...prev.contact, ...newSettings.contact },
        }));
    };

    const addProduct = (product: Product) => {
        setProducts(prev => [...prev, product]);
    };

    const updateProduct = (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };

    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const addCollection = (name: string) => {
        if (!collections.includes(name)) {
            setCollections(prev => [...prev, name]);
        }
    };

    const deleteCollection = (name: string) => {
        setCollections(prev => prev.filter(c => c !== name));
    };

    const login = (password: string) => {
        if (password === 'artesana2026') {
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('is_admin_auth');
    };

    const clearAllData = () => {
        if (confirm('¿Estás seguro de resetear todos los datos? Se borrarán tus productos y configuraciones personalizadas.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    // Prevent hydration mismatch by only rendering once loaded
    if (!isLoaded) return null;

    return (
        <SettingsContext.Provider value={{
            settings,
            products,
            collections,
            isAuthenticated,
            updateSettings,
            addProduct,
            updateProduct,
            deleteProduct,
            addCollection,
            deleteCollection,
            materials,
            login,
            logout,
            storageError,
            clearAllData
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
