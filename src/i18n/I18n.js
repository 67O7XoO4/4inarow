
import en from './en.js'
import fr from './fr.js'

const messages = {
    en,
    fr
  }

  // Create VueI18n instance with options
  const i18n = new VueI18n({ 
    locale: navigator.language,
    fallbackLocale: 'en',
    messages 
  })

  export default i18n