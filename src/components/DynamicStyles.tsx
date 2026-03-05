"use client";
import { useSettings } from '@/context/SettingsContext';

export default function DynamicStyles() {
    const { settings } = useSettings();

    return (
        <style dangerouslySetInnerHTML={{
            __html: `
        :root {
          --primary: ${settings.colors.primary};
          --secondary: ${settings.colors.secondary};
          --accent: ${settings.colors.accent};
          --background: ${settings.colors.background};
          --primary-shadow: ${settings.colors.primary}40;
        }
      `
        }} />
    );
}
