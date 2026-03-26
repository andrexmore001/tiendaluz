'use client';
 
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useSettings } from '@/context/SettingsContext';
 
export default function ChatWidget() {
  const pathname = usePathname();
  const { settings, isLoaded } = useSettings();
 
  // Do not show the chat widget on admin pages or if settings haven't loaded
  if (!isLoaded || pathname?.startsWith('/admin')) {
    return null;
  }
 
  // Only render if we have both values and they are not empty
  if (!settings.chatBusinessId || !settings.chatApiKey) {
    return null;
  }
 
  return (
    /* Chatbot script temporarily disabled
    <Script
      src="https://web-chat-self-beta.vercel.app/loader.js"
      data-business-id={settings.chatBusinessId}
      data-api-key={settings.chatApiKey}
      strategy="afterInteractive"
    />
    */
    null
  );
}
