"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, siteSettings as initialSettings, products as initialProducts, collections as initialCollections, boxShapes as initialBoxShapes } from '@/lib/data';
import { Product, BoxShape, Collection } from '@/types/product';

export interface Material {
    id: string;
    name: string;

    /* Tipo físico */
    type: "corrugated" | "mdf" | "wood";

    /* Propiedades industriales */
    thickness_mm: number;
    tolerance_mm: number;
    stiffness_factor: number;

    /* Visual */
    textureUrl?: string;
    baseColor?: string;
    roughness?: number;
    metalness?: number;
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
    boxShapes: BoxShape[];
    addBoxShape: (shape: BoxShape) => void;
    updateBoxShape: (shape: BoxShape) => void;
    deleteBoxShape: (id: string) => void;
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
    const [boxShapes, setBoxShapes] = useState<BoxShape[]>(initialBoxShapes);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [storageError, setStorageError] = useState<string | null>(null);

    // Initial load from API (falling back to localStorage for migration if needed)
    useEffect(() => {
        const loadAllData = async () => {
            try {
                setIsInitialLoading(true);

                // Fetch from API
                const [resSettings, resProducts, resCollections, resMaterials, resShapes] = await Promise.all([
                    fetch('/api/settings').then(r => r.json()),
                    fetch('/api/products').then(r => r.json()),
                    fetch('/api/collections').then(r => r.json()),
                    fetch('/api/materials').then(r => r.json()),
                    fetch('/api/box-shapes').then(r => r.json())
                ]);

                if (resSettings && !resSettings.error) {
                    // Map DB format to SiteSettings
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
                        heroImages: resSettings.heroImages ? JSON.parse(resSettings.heroImages) : [],
                        updatedAt: resSettings.updatedAt
                    });
                }

                if (Array.isArray(resProducts)) {
                    setProducts(resProducts);
                }

                if (Array.isArray(resCollections)) setCollections(resCollections);
                if (Array.isArray(resMaterials)) setMaterials(resMaterials);
                if (Array.isArray(resShapes)) {
                    setBoxShapes(resShapes);
                }

            } catch (e) {
                console.error("Error loading from API", e);
                // Fallback to localStorage logic if API fails or for first-time migration
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

    const addBoxShape = async (shape: BoxShape) => {
        setBoxShapes(prev => [...prev, shape]);
        try {
            await fetch('/api/box-shapes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shape)
            });
        } catch (e) {
            console.error("Error adding shape", e);
        }
    };

    const updateBoxShape = async (updatedShape: BoxShape) => {
        setBoxShapes(prev => prev.map(s => s.id === updatedShape.id ? updatedShape : s));
        try {
            await fetch('/api/box-shapes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedShape)
            });
        } catch (e) {
            console.error("Error updating shape", e);
        }
    };

    const deleteBoxShape = async (id: string) => {
        setBoxShapes(prev => prev.filter(s => s.id !== id));
        try {
            await fetch(`/api/box-shapes?id=${id}`, {
                method: 'DELETE',
            });
        } catch (e) {
            console.error("Error deleting shape", e);
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
            boxShapes,
            addBoxShape,
            updateBoxShape,
            deleteBoxShape,
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
