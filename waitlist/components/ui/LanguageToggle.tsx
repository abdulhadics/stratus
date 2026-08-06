'use client';

import { useTranslation, type Language } from '@/lib/i18n';

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-1 text-mono text-[11px]">
      <button
        onClick={() => setLanguage('en')}
        className={`transition-colors px-1 ${
          language === 'en' ? 'text-text-primary' : 'text-text-dimmed hover:text-text-secondary'
        }`}
        aria-label="Switch to English"
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <span className="text-text-dimmed">|</span>
      <button
        onClick={() => setLanguage('fr')}
        className={`transition-colors px-1 ${
          language === 'fr' ? 'text-text-primary' : 'text-text-dimmed hover:text-text-secondary'
        }`}
        aria-label="Passer au français"
        aria-pressed={language === 'fr'}
      >
        FR
      </button>
    </div>
  );
}
