"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, siteSettings as initialSettings, products as initialProducts, collections as initialCollections } from '@/lib/data';
import { Product, Collection } from '@/types/product';

export interface Material {
    id: string;
    name: string;
    textureUrl?: string;
}

interface SettingsContextType {
    settings: SiteSettings;
    products: Product[];
    collections: Collection[];
    updateSettings: (newSettings: Partial<SiteSettings>) => void;
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    addCollection: (collection: Collection) => void;
    updateCollection: (collection: Collection) => void;
    deleteCollection: (id: string) => void;
    materials: Material[];
    addMaterial: (material: Material) => void;
    updateMaterial: (material: Material) => void;
    deleteMaterial: (id: string) => void;
    storageError: string | null;
    clearAllData: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(initialSettings);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [collections, setCollections] = useState<Collection[]>(initialCollections);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [storageError, setStorageError] = useState<string | null>(null);

    // Initial load from API (falling back to localStorage for migration if needed)
    useEffect(() => {
        const loadAllData = async () => {
            try {
                setIsInitialLoading(true);

                // Fetch everything in ONE call
                const response = await fetch('/api/bootstrap');
                const data = await response.json();

                if (data && !data.error) {
                    const { settings: resSettings, products: resProducts, collections: resCollections, materials: resMaterials } = data;

                    if (resSettings) {
                        setSettings({
                            title: resSettings.title,
                            slug: resSettings.slug,
                            logo: resSettings.logo || '',
                            colors: {
                                primary: resSettings.primaryColor,
                                secondary: resSettings.secondaryColor,
                                accent: resSettings.accentColor,
                                background: resSettings.backgroundColor
                            },
                            contact: {
                                phone: resSettings.phone,
                                email: resSettings.email,
                                address: resSettings.address,
                                instagram: resSettings.instagram,
                                facebook: resSettings.facebook
                            },
                            heroTitle: resSettings.heroTitle || '',
                            heroSubtitle: resSettings.heroSubtitle || '',
                            heroImages: Array.isArray(resSettings.heroImages) ? resSettings.heroImages : [],
                            updatedAt: resSettings.updatedAt
                        });
                    }

                    if (Array.isArray(resProducts)) setProducts(resProducts);
                    if (Array.isArray(resCollections)) setCollections(resCollections);
                    if (Array.isArray(resMaterials)) setMaterials(resMaterials);
                }

            } catch (e) {
                console.error("Error loading bootstrap data", e);
                // Fallback to localStorage logic if API fails
                const savedProducts = localStorage.getItem('artesana_products');
                if (savedProducts) setProducts(JSON.parse(savedProducts));
            } finally {
                setIsLoaded(true);
                setIsInitialLoading(false);
            }
        };

        loadAllData();
    }, []);

    // Update document title when settings title changes
    useEffect(() => {
        if (settings.title) {
            document.title = `${settings.title} | Cajas Personalizadas`;
        }
    }, [settings.title]);

    // Save to API instead of localStorage
    const updateSettings = async (newSettings: Partial<SiteSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
        } catch (e) {
            console.error("Error saving settings", e);
        }
    };

    const addProduct = async (product: Product) => {
        setProducts(prev => [...prev, product]);
        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
        } catch (e) {
            console.error("Error adding product", e);
        }
    };

    const updateProduct = async (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct)
            });
        } catch (e) {
            console.error("Error updating product", e);
        }
    };

    const deleteProduct = async (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        try {
            await fetch(`/api/products?id=${id}`, {
                method: 'DELETE',
            });
        } catch (e) {
            console.error("Error deleting product", e);
        }
    };

    const addCollection = async (collection: Collection) => {
        if (!collections.find(c => c.id === collection.id)) {
            setCollections(prev => [...prev, collection]);
            try {
                await fetch('/api/collections', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(collection)
                });
            } catch (e) {
                console.error("Error adding collection", e);
            }
        }
    };

    const updateCollection = async (updatedCollection: Collection) => {
        setCollections(prev => prev.map(c => c.id === updatedCollection.id ? updatedCollection : c));
        try {
            await fetch('/api/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCollection)
            });
        } catch (e) {
            console.error("Error updating collection", e);
        }
    };

    const deleteCollection = async (id: string) => {
        setCollections(prev => prev.filter(c => c.id !== id));
        try {
            await fetch(`/api/collections?id=${id}`, {
                method: 'DELETE',
            });
        } catch (e) {
            console.error("Error deleting collection", e);
        }
    };


    const addMaterial = async (material: Material) => {
        setMaterials(prev => [...prev, material]);
        try {
            await fetch('/api/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(material)
            });
        } catch (e) {
            console.error("Error adding material", e);
        }
    };

    const updateMaterial = async (updatedMaterial: Material) => {
        setMaterials(prev => prev.map(m => m.id === updatedMaterial.id ? updatedMaterial : m));
        try {
            await fetch('/api/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedMaterial)
            });
        } catch (e) {
            console.error("Error updating material", e);
        }
    };

    const deleteMaterial = async (id: string) => {
        setMaterials(prev => prev.filter(m => m.id !== id));
        try {
            await fetch(`/api/materials?id=${id}`, {
                method: 'DELETE',
            });
        } catch (e) {
            console.error("Error deleting material", e);
        }
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
            updateSettings,
            addProduct,
            updateProduct,
            deleteProduct,
            addCollection,
            updateCollection,
            deleteCollection,
            materials,
            addMaterial,
            updateMaterial,
            deleteMaterial,
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
