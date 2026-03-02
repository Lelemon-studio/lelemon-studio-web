/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  fbq: (...args: any[]) => void;
  gtag: (...args: any[]) => void;
}
