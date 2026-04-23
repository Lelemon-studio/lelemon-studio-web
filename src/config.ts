/**
 * Site configuration — shared across all components
 *
 * Lead form values come from the Lelemon dashboard (Formularios section).
 * Each client site has its own formId and apiKey.
 */

// ── Lelemon API ──
export const API_URL = "https://api.lelemon.cl";

// ── Cloudflare Turnstile ──
export const TURNSTILE_SITE_KEY = "0x4AAAAAACoUQw1n9VsY3O9E";

// ── PostHog (analytics + session replay) ──
export const POSTHOG_KEY = "phc_xZYcoYxdPfrSvdd2xYJGvV8rYbGU9EQvYzxdotgbSFah";
export const POSTHOG_HOST = "https://us.i.posthog.com";

// ── Lead Form (Lelemon landing) ──
export const LEAD_FORM_ID = "a3f854a7-81ab-4703-ba18-74fd75c1a9f2";
export const LEAD_FORM_API_KEY = "lf_6d554633505899dc2efd1a9e3e9da4b4adcb7ef2b9e0111a";
