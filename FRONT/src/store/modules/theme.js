// ============================================
// Pinia Store - application theme mode & settings
// ============================================
import { defineStore } from 'pinia';
import { ref } from 'vue';
export const THEME_STORAGE_KEY = 'liangcang-theme';
export const DEFAULT_THEME = 'blue';
/** LocalStorage key for background image toggle */
export const BG_ENABLED_STORAGE_KEY = 'liangcang-bg-enabled';
/** LocalStorage key for background mask opacity (0-100) */
export const BG_MASK_STORAGE_KEY = 'liangcang-bg-mask';
export function isThemeMode(value) {
    return value === 'green' || value === 'blue';
}
export function readStoredTheme() {
    try {
        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isThemeMode(storedTheme) ? storedTheme : DEFAULT_THEME;
    }
    catch {
        return DEFAULT_THEME;
    }
}
export function syncDocumentTheme(theme) {
    if (typeof document !== 'undefined') {
        document.documentElement.dataset.theme = theme;
    }
}
/** Applies the persisted/default mode before Vue renders its first component. */
export function bootstrapTheme() {
    const theme = readStoredTheme();
    syncDocumentTheme(theme);
    return theme;
}
function readStoredBgEnabled() {
    try {
        const stored = window.localStorage.getItem(BG_ENABLED_STORAGE_KEY);
        return stored === null ? true : stored === 'true';
    }
    catch {
        return true;
    }
}
function readStoredMaskOpacity() {
    try {
        const stored = window.localStorage.getItem(BG_MASK_STORAGE_KEY);
        if (stored === null)
            return 8;
        const parsed = parseInt(stored, 10);
        return isNaN(parsed) ? 8 : Math.max(0, Math.min(20, parsed));
    }
    catch {
        return 8;
    }
}
export const useThemeStore = defineStore('theme', () => {
    const theme = ref(readStoredTheme());
    const bgEnabled = ref(readStoredBgEnabled());
    const bgMaskOpacity = ref(readStoredMaskOpacity());
    function setTheme(nextTheme) {
        if (!isThemeMode(nextTheme)) {
            console.warn(`[themeStore] 无效的主题值: ${String(nextTheme)}`);
            return false;
        }
        theme.value = nextTheme;
        syncDocumentTheme(nextTheme);
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        }
        catch {
            // Storage can be unavailable in privacy-restricted contexts; the live
            // document state remains usable for this session.
        }
        return true;
    }
    function toggleTheme() {
        setTheme(theme.value === 'blue' ? 'green' : 'blue');
    }
    function setBgEnabled(enabled) {
        bgEnabled.value = enabled;
        try {
            window.localStorage.setItem(BG_ENABLED_STORAGE_KEY, String(enabled));
        }
        catch { /* ignore */ }
    }
    function setBgMaskOpacity(opacity) {
        const clamped = Math.max(0, Math.min(20, opacity));
        bgMaskOpacity.value = clamped;
        try {
            window.localStorage.setItem(BG_MASK_STORAGE_KEY, String(clamped));
        }
        catch { /* ignore */ }
    }
    function hydrateTheme() {
        setTheme(readStoredTheme());
    }
    return {
        theme,
        bgEnabled,
        bgMaskOpacity,
        setTheme,
        toggleTheme,
        setBgEnabled,
        setBgMaskOpacity,
        hydrateTheme,
    };
});
