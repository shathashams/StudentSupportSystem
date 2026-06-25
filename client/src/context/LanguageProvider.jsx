/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import ar from '../i18n/ar.json'
import en from '../i18n/en.json'
import he from '../i18n/he.json'
import ru from '../i18n/ru.json'

const DICTIONARIES = { en, ar, he, ru }

export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr', locale: 'en-GB' },
  { code: 'ar', label: 'العربية', dir: 'rtl', locale: 'ar' },
  { code: 'he', label: 'עברית', dir: 'rtl', locale: 'he-IL' },
  { code: 'ru', label: 'Русский', dir: 'ltr', locale: 'ru-RU' },
]

const STORAGE_KEY = 'lang'

const getLanguage = (code) =>
  LANGUAGES.find((language) => language.code === code) || LANGUAGES[0]

const getInitialLang = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return DICTIONARIES[stored] ? stored : 'en'
}

// Resolve a dot-separated key against a dictionary object.
const lookup = (dictionary, key) =>
  key.split('.').reduce((value, part) => (value == null ? undefined : value[part]), dictionary)

const interpolate = (text, vars) =>
  Object.keys(vars).reduce(
    (result, name) => result.replaceAll(`{${name}}`, vars[name]),
    text,
  )

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang)
  const { dir, locale } = getLanguage(lang)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  const t = useMemo(() => {
    return (key, vars) => {
      const value = lookup(DICTIONARIES[lang], key) ?? lookup(DICTIONARIES.en, key)
      if (value == null) {
        return key
      }
      return vars ? interpolate(value, vars) : value
    }
  }, [lang])

  const value = useMemo(
    () => ({ lang, setLang, dir, locale, t, languages: LANGUAGES }),
    [lang, dir, locale, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
