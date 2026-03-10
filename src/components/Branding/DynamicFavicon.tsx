"use client";
import React, { useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';

const DynamicFavicon = () => {
    const { settings } = useSettings();

    useEffect(() => {
        if (settings.logo) {
            // Remove existing favicons
            const links = document.querySelectorAll("link[rel*='icon']");
            links.forEach(link => link.parentNode?.removeChild(link));

            // Create new favicon link
            const link = document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = settings.logo;
            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }, [settings.logo]);

    return null;
};

export default DynamicFavicon;
