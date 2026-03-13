'use client';
 
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useSettings } from '@/context/SettingsContext';
 
export default function ChatWidget() {
  const pathname = usePathname();
  const { settings } = useSettings();
 
  // Do not show the chat widget on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }
 
  if (!settings.chatBusinessId || !settings.chatApiKey) {
    return null;
  }
 
  return (
    <Script
      src="https://web-chat-self-beta.vercel.app/loader.js"
      data-business-id={settings.chatBusinessId}
      data-api-key={settings.chatApiKey}
      strategy="afterInteractive"
    />
  );
}
