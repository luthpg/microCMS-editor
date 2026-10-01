import { useEffect, useState } from 'react';
import type { AppSettings } from '@/types';

const STORAGE_KEYS = {
  DOMAIN: 'mc_domain',
  KEY: 'mc_key',
  ENDPOINT: 'mc_endpoint',
  THEME: 'mc_theme',
} as const;

export function useSettings() {
  const [domain, setDomain] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEYS.DOMAIN) ?? '';
  });

  const [apiKey, setApiKey] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEYS.KEY) ?? '';
  });

  const [endpoint, setEndpoint] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEYS.ENDPOINT) ?? '';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOMAIN, domain);
  }, [domain]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KEY, apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENDPOINT, endpoint);
  }, [endpoint]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isConfigured = domain.trim().length > 0 && apiKey.trim().length > 0;

  const saveSettings = (newSettings: AppSettings) => {
    setDomain(newSettings.domain.trim());
    setApiKey(newSettings.apiKey.trim());
    setEndpoint(newSettings.endpoint.trim());
  };

  return {
    domain,
    setDomain,
    apiKey,
    setApiKey,
    endpoint,
    setEndpoint,
    theme,
    toggleTheme,
    isConfigured,
    saveSettings,
  };
}
