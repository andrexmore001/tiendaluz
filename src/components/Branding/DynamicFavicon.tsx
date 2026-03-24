"use client";
import React, { useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';

const DynamicFavicon = () => {
    const { settings } = useSettings();

    useEffect(() => {
        if (!settings.logo) return;

        // Try to find existing dynamic favicon or create one
        let link = document.querySelector("link[rel*='icon'][data-dynamic='true']") as HTMLLinkElement;

        if (!link) {
            link = document.createElement('link');
            link.rel = 'shortcut icon';
            link.dataset.dynamic = 'true';
            document.head.appendChild(link);
        }

        link.href = settings.logo;

        // Note: We don't remove other icons here to avoid React/Next.js removeChild errors.
        // Browsers prioritize the last icon added or specific rel types.
    }, [settings.logo]);

    return null;
};

export default DynamicFavicon;
