import React from 'react';
import { AlertTriangle, Globe, Bell, Sun, Moon } from 'lucide-react';
import { SupportedLanguage } from '../types/emergency';
import { TRANSLATIONS, INDIAN_LANGUAGES } from '../utils/translations';

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onOpenNotifications: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenNotifications,
  theme = 'light',
  onToggleTheme,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  return (
    <header className="app-header">
      <div className="brand-badge-row">
        <h1 className="brand-title">
          <span className="flag-strip" aria-label="Indian Flag Colors">
            <span className="flag-orange" />
            <span className="flag-white" />
            <span className="flag-green" />
          </span>
          {t.appName}
        </h1>

        <div className="header-actions-row">
          {/* Accessible All-Indian-Language Selector */}
          <div className="language-selector-wrap" aria-label="Select Language">
            <Globe size={16} className="lang-globe-icon" aria-hidden="true" />
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              className="language-select-dropdown"
              aria-label="Change Language across 13 Indian Languages"
            >
              {INDIAN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Dark / Light Theme Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              className={`btn-theme-toggle ${theme === 'dark' ? 'is-dark' : 'is-light'}`}
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun size={17} className="theme-icon sun-icon animate-spin-once" />
              ) : (
                <Moon size={17} className="theme-icon moon-icon animate-spin-once" />
              )}
            </button>
          )}

          {/* Emergency Alerts & Push Notifications Trigger */}
          <button
            type="button"
            className="btn-header-notif"
            onClick={onOpenNotifications}
            title={t.notifications.title}
            aria-label="Open emergency notification settings"
          >
            <span className="notif-icon-wrap">
              <Bell size={16} />
              <span className="notif-pulse-dot" aria-hidden="true" />
            </span>
            <span className="notif-btn-label">{t.notifications.enableBtn}</span>
          </button>

          <span className="prototype-tag" role="status">
            {t.prototypeTag}
          </span>
        </div>
      </div>

      <div className="not-dispatcher-notice" role="alert">
        <AlertTriangle size={20} className="flex-shrink-0" aria-hidden="true" />
        <div>{t.notDispatcherWarning}</div>
      </div>
    </header>
  );
};
