"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, siteSettings as initialSettings, products as initialProducts, collections as initialCollections, boxShapes as initialBoxShapes } from '@/lib/data';
import { Product, BoxShape, Collection } from '@/types/product';

export interface Material {
    id: string;
    name: string;
    textureUrl: string;
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [storageError, setStorageError] = useState<string | null>(null);

    const [materials, setMaterials] = useState<Material[]>([
        { id: 'carton-kraft', name: 'Cartón Kraft', textureUrl: '/materials/kraft.png', baseColor: '#e3c5a8' },
        { id: 'madera', name: 'Madera Clara', textureUrl: '/materials/wood.png', baseColor: '#f1dabf' },
        { id: 'MDF', name: 'MDF', textureUrl: '/materials/mdf.png', baseColor: '#d9c5a3' }
    ]);

    // Initial load from localStorage
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('artesana_settings');
            const savedProducts = localStorage.getItem('artesana_products');
            const savedCollections = localStorage.getItem('artesana_collections');
            const savedBoxShapes = localStorage.getItem('artesana_box_shapes');
            const savedMaterials = localStorage.getItem('artesana_materials');
            const savedAuth = localStorage.getItem('is_admin_auth');

            if (savedSettings) setSettings(JSON.parse(savedSettings));

            if (savedProducts) {
                const parsed: Product[] = JSON.parse(savedProducts);
                // Basic migration: Ensure all products have all current fields
                const migrated = parsed.map(p => {
                    const defaultP = initialProducts.find(ip => ip.id === p.id);
                    return {
                        ...defaultP, // Start with defaults if it exists in code
                        ...p,         // Overwrite with saved data
                        dimensions: { ...defaultP?.dimensions, ...p.dimensions }
                    };
                });
                setProducts(migrated as Product[]);
            }

            if (savedCollections) {
                const parsed = JSON.parse(savedCollections);
                // Migration from string[] to Collection[]
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                    const migrated: Collection[] = parsed.map((name, index) => {
                        const existing = initialCollections.find(c => c.name === name);
                        return existing || { id: `col_${Date.now()}_${index}`, name, description: '' };
                    });
                    setCollections(migrated);
                } else {
                    setCollections(parsed);
                }
            }

            if (savedBoxShapes) {
                const parsed: BoxShape[] = JSON.parse(savedBoxShapes);
                const migrated = parsed.map(s => {
                    const defaultS = initialBoxShapes.find(ds => ds.id === s.id);
                    return { ...defaultS, ...s };
                });
                setBoxShapes(migrated);
            }

            if (savedMaterials) setMaterials(JSON.parse(savedMaterials));
            if (savedAuth === 'true') setIsAuthenticated(true);
        } catch (e) {
            console.error("Error loading from storage", e);
        }

        // SYNC ACROSS TABS
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'artesana_products' && e.newValue) setProducts(JSON.parse(e.newValue));
            if (e.key === 'artesana_settings' && e.newValue) setSettings(JSON.parse(e.newValue));
            if (e.key === 'artesana_collections' && e.newValue) {
                const parsed = JSON.parse(e.newValue);
                // Migration in sync
                if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                    const migrated: Collection[] = parsed.map((name, index) => ({ id: `col_${index}`, name, description: '' }));
                    setCollections(migrated);
                } else {
                    setCollections(parsed);
                }
            }
            if (e.key === 'artesana_box_shapes' && e.newValue) setBoxShapes(JSON.parse(e.newValue));
            if (e.key === 'artesana_materials' && e.newValue) setMaterials(JSON.parse(e.newValue));
        };

        window.addEventListener('storage', handleStorageChange);
        setIsLoaded(true);

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Separate saving to avoid clobbering states across tabs
    useEffect(() => { if (isLoaded) localStorage.setItem('artesana_settings', JSON.stringify(settings)); }, [settings, isLoaded]);
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem('artesana_products', JSON.stringify(products));
                setStorageError(null);
            } catch (e) {
                setStorageError("Espacio lleno. Reduce el tamaño de las fotos.");
            }
        }
    }, [products, isLoaded]);
    useEffect(() => { if (isLoaded) localStorage.setItem('artesana_collections', JSON.stringify(collections)); }, [collections, isLoaded]);
    useEffect(() => { if (isLoaded) localStorage.setItem('artesana_box_shapes', JSON.stringify(boxShapes)); }, [boxShapes, isLoaded]);
    useEffect(() => { if (isLoaded) localStorage.setItem('artesana_materials', JSON.stringify(materials)); }, [materials, isLoaded]);
    useEffect(() => { if (isLoaded) localStorage.setItem('is_admin_auth', isAuthenticated.toString()); }, [isAuthenticated, isLoaded]);

    // Apply CSS variables to the document root whenever settings change
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary', settings.colors.primary);
        root.style.setProperty('--primary-light', `${settings.colors.primary}15`);
        root.style.setProperty('--primary-shadow', `${settings.colors.primary}40`);
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
