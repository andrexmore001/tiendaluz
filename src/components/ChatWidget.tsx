'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function ChatWidget() {
  const pathname = usePathname();

  // Do not show the chat widget on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <Script
      src="https://web-chat-self-beta.vercel.app/loader.js"
      data-business-id="mvp-test-123"
      data-api-key="key_test_123"
      strategy="afterInteractive"
    />
  );
}
