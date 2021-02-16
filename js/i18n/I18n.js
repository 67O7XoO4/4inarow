
import Vue from 'vue';
import VueI18n from 'vue-i18n'

import en from './en.js'
import fr from './fr.js'

const messages = {
    en,
    fr
  }

  Vue.use(VueI18n);

  // Create VueI18n instance with options
  const i18n = new VueI18n({ 
    locale: navigator.language,
    fallbackLocale: 'en',
    silentTranslationWarn: true,
    messages 
  })

  export default i18n