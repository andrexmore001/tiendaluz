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
    isAuthenticated: boolean;
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
    login: (password: string) => boolean;
    logout: () => void;
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
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
                        }
                    });
                }

                if (Array.isArray(resProducts)) {
                    setProducts(resProducts.map(p => ({
                        ...p,
                        dimensions: { width: p.width, height: p.height, depth: p.depth },
                        images: p.images.map((img: any) => ({
                            url: img.url,
                            textConfig: { x: img.textX, y: img.textY, rotation: img.rotation, scale: img.scale }
                        }))
                    })));
                }

                if (Array.isArray(resCollections)) setCollections(resCollections);
                if (Array.isArray(resMaterials)) setMaterials(resMaterials);
                if (Array.isArray(resShapes)) {
                    setBoxShapes(resShapes.map(s => ({
                        ...s,
                        defaultDimensions: { width: s.width, height: s.height, depth: s.depth }
                    })));
                }

                // Auth still in localStorage for simplicity in this MVP
                const savedAuth = localStorage.getItem('is_admin_auth');
                if (savedAuth === 'true') setIsAuthenticated(true);

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
        // Add delete route later if needed, for now upsert covers it in the UI flow
    };

    const addCollection = (collection: Collection) => {
        if (!collections.find(c => c.id === collection.id)) {
            setCollections(prev => [...prev, collection]);
        }
    };

    const updateCollection = (updatedCollection: Collection) => {
        setCollections(prev => prev.map(c => c.id === updatedCollection.id ? updatedCollection : c));
    };

    const deleteCollection = (id: string) => {
        setCollections(prev => prev.filter(c => c.id !== id));
    };

    const addBoxShape = (shape: BoxShape) => {
        setBoxShapes(prev => [...prev, shape]);
    };

    const updateBoxShape = (updatedShape: BoxShape) => {
        setBoxShapes(prev => prev.map(s => s.id === updatedShape.id ? updatedShape : s));
    };

    const deleteBoxShape = (id: string) => {
        setBoxShapes(prev => prev.filter(s => s.id !== id));
    };

    const addMaterial = (material: Material) => {
        setMaterials(prev => [...prev, material]);
    };

    const updateMaterial = (updatedMaterial: Material) => {
        setMaterials(prev => prev.map(m => m.id === updatedMaterial.id ? updatedMaterial : m));
    };

    const deleteMaterial = (id: string) => {
        setMaterials(prev => prev.filter(m => m.id !== id));
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
