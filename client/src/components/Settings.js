import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../translations/translations';

function Settings({ isOpen, onClose }) {
  const { theme, language, toggleTheme, toggleLanguage } = useSettings();
  const t = translations[language];

  const resetSplashScreen = () => {
    localStorage.removeItem('hasVisitedBefore');
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t.settings}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme Setting */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t.theme}
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'light'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
                <span>{t.lightTheme}</span>
              </button>
              <button
                onClick={toggleTheme}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                <span>{t.darkTheme}</span>
              </button>
            </div>
          </div>

          {/* Language Setting */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t.language}
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  language === 'english'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                }`}
              >
                <span className="text-lg">🇺🇸</span>
                <span>{t.english}</span>
              </button>
              <button
                onClick={toggleLanguage}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  language === 'hindi'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                }`}
              >
                <span className="text-lg">🇮🇳</span>
                <span>{t.hindi}</span>
              </button>
            </div>
          </div>

          {/* Reset Splash Screen */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              App Settings
            </h3>
            <button
              onClick={resetSplashScreen}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Reset Welcome Screen
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings; 