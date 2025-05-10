const SETTINGS = {
  loadThirdPartyInventory: "qs-inventory",
};

const LOCALE_OVERRIDES = {};

const ITEM_DEFAULTS = {
  weight: 1,
  stackable: true,
  usable: false,
  initialDurability: 100,
  droppable: true,
  decayable: false,
  groundObject: "hei_prop_hei_paper_bag",
  tradable: false,
  rarity: "common",
};

if (typeof exports !== "undefined") {
  exports("SETTINGS", SETTINGS);
  exports("LOCALE_OVERRIDES", LOCALE_OVERRIDES);
  exports("ITEM_DEFAULTS", ITEM_DEFAULTS);
}

if (typeof window !== "undefined") {
  window.SETTINGS = SETTINGS;
  window.LOCALE_OVERRIDES = LOCALE_OVERRIDES;
  window.ITEM_DEFAULTS = ITEM_DEFAULTS;
}
