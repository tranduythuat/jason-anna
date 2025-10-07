let translations = {};
let currentLang = "en";

export async function loadTranslations(lang) {
  currentLang = lang;
  const response = await fetch(`./assets/lang/${lang}.json`);
  translations = await response.json();
  document.documentElement.setAttribute("lang", lang);
}

// Hàm lấy text theo key, ví dụ __('alert.successText')
export function __(key) {
  const keys = key.split(".");
  let value = translations;
  for (const k of keys) {
    if (value && k in value) value = value[k];
    else return key; // nếu không tìm thấy thì trả lại key
  }
  return value;
}
