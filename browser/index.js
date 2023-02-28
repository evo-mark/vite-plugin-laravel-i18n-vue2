import Vue from "vue";
import VueI18n from "vue-i18n";
import axios from "axios";
import messages from "languages/php_en.json";

Vue.use(VueI18n);

export const i18n = new VueI18n({
	locale: "en",
	fallbackLocale: "en",
	messages: {
		en: messages,
	},
	silentTranslationWarn: true,
	silentFallbackWarn: true,
});

const loadedLanguages = ["en"];

function setI18nLanguage(lang) {
	i18n.locale = lang;
	axios.defaults.headers.common["Accept-Language"] = lang;
	document.querySelector("html").setAttribute("lang", lang);
	return lang;
}

export function loadLanguageAsync(lang) {
	// If the same language
	if (i18n.locale === lang) {
		return Promise.resolve(setI18nLanguage(lang));
	}

	// If the language was already loaded
	if (loadedLanguages.includes(lang)) {
		return Promise.resolve(setI18nLanguage(lang));
	}

	const languages = import.meta.glob(`languages/*.json`);

	// If the language hasn't been loaded yet
	return languages[`languages/php_${lang}.json`]().then((messages) => {
		i18n.setLocaleMessage(lang, messages.default);
		loadedLanguages.push(lang);
		return setI18nLanguage(lang);
	});
}
