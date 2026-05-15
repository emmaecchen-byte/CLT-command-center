import { createContext, useContext } from 'react'

export type Language = 'en' | 'zh'

export type LanguageContextValue = {
  language: Language
  toggleLanguage: () => void
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return value
}
