export type Theme = "dark" | "light";

const KEY = "yoklama-theme";

/** SSR'da her zaman "dark" döner — gerçek tercih sadece tarayıcıda (localStorage) bilinir. */
export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(KEY) === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // localStorage kapalıysa (gizli sekme vb.) sessizce yut — tema yine de o oturumda uygulanmış olur
  }
}

/**
 * Sayfa yüklenirken <html> class'ını localStorage'a göre ayarlayan, senkron
 * çalışan script metni. next/script ile strategy="beforeInteractive" olarak
 * enjekte edilir — böylece kullanıcı "açık" seçtiyse sayfa bir anlığına bile
 * koyu temada "yanıp sönmez".
 */
export const NO_FLASH_THEME_SCRIPT = `(function(){try{if(localStorage.getItem('${KEY}')==='light'){document.documentElement.classList.remove('dark')}}catch(e){}})();`;
