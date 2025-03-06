const SETTINGS = {};

const LOCALE_OVERRIDES = {};

if (typeof exports !== "undefined") {
  exports("SETTINGS", SETTINGS);
  exports("LOCALE_OVERRIDES", LOCALE_OVERRIDES);
}

if (typeof window !== "undefined") {
  window.SETTINGS = SETTINGS;
  window.LOCALE_OVERRIDES = LOCALE_OVERRIDES;
}
