//@flow
import Storage from "../storage";

const STORAGE_LOCALE_KEY = "locale";
const DEFAULT_LOCALE = "en";

const localeStorage = new Storage<string>(STORAGE_LOCALE_KEY);

let texts:Map<string, string> = new Map();

// Return the users locale
export const getLocale = () => localeStorage.load() || DEFAULT_LOCALE;

export const setLocale = async (locale: string) => {
    await loadLocale(locale);
    localeStorage.save(locale);
};

export const getText = (key: string) => {
    if (texts && texts.has(key)) {
        return texts.get(key);
    } else {
        // TODO warn
        return key;
    }
}

export const init = () => {
    return loadLocale(getLocale());
};

const loadLocale = async (locale: string) => {
    //$FlowFixMe
    const json:{[key: string]: string} = await import(`lang_${locale}.json`);

    texts = new Map<string, string>(
        (Object.entries(json) : any)
    );
};
