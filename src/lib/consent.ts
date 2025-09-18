export const CONSENT_KEY = 'prometeo_telemetry_consent_v1';

export const getConsent = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const raw = window.localStorage.getItem(CONSENT_KEY);
    return raw === 'granted';
  } catch (e) {
    return false;
  }
};

export const setConsent = (granted: boolean) => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  } catch (e) {
    // noop
  }
};

export default { getConsent, setConsent };
