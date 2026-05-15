import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { LanguageContext, type Language } from './LanguageContext'
import { translateUi } from './translateUi'

const STORAGE_KEY = 'clt-command-center-language'

function readLanguage(): Language {
  return localStorage.getItem(STORAGE_KEY) === 'zh' ? 'zh' : 'en'
}

function shouldSkip(node: Node) {
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement
  return Boolean(
    element?.closest(
      'script, style, textarea, [data-no-translate="true"], [data-no-translate]',
    ),
  )
}

function applyLanguage(language: Language) {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  document.title = translateUi(document.title, language)

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    if (!shouldSkip(node)) textNodes.push(node)
  }

  textNodes.forEach((node) => {
    const translated = translateUi(node.nodeValue ?? '', language)
    if (translated !== node.nodeValue) node.nodeValue = translated
  })

  document
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input[placeholder], textarea[placeholder]',
    )
    .forEach((element) => {
      if (shouldSkip(element)) return
      const translated = translateUi(element.placeholder, language)
      if (translated !== element.placeholder) element.placeholder = translated
    })
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readLanguage)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language)
    applyLanguage(language)

    let applying = false
    const observer = new MutationObserver(() => {
      if (applying) return
      applying = true
      window.requestAnimationFrame(() => {
        applyLanguage(language)
        applying = false
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => observer.disconnect()
  }, [language])

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => (current === 'en' ? 'zh' : 'en'))
  }, [])

  const value = useMemo(
    () => ({ language, toggleLanguage }),
    [language, toggleLanguage],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
