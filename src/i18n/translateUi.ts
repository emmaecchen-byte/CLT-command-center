import type { Language } from './LanguageContext'
import { enUS, zhCN } from 'date-fns/locale'
import { UI_EN_TO_ZH } from './uiDictionary'

const ZH_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(UI_EN_TO_ZH).map(([en, zh]) => {
    const zn = normalizeUiText(zh)
    return [zn, en]
  }),
)

function normalizeUiText(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

export function translateUi(text: string, language: Language): string {
  const leading = text.match(/^\s*/)?.[0] ?? ''
  const trailing = text.match(/\s*$/)?.[0] ?? ''
  const normalized = normalizeUiText(text)
  if (!normalized) return text
  if (language === 'zh') {
    const zh = UI_EN_TO_ZH[normalized]
    return zh ? `${leading}${zh}${trailing}` : text
  }
  const en = ZH_TO_EN[normalized]
  return en ? `${leading}${en}${trailing}` : text
}

export function dateFnsLocale(language: Language) {
  return language === 'zh' ? zhCN : enUS
}
