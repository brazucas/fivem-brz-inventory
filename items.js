const ITEMS = [
  {
    id: "crowbar",
    name: "Crowbar",
    type: "other",
    description:
      "A trusty tool for prying things open, or for when you just need to make a point.",
    tier: 1,
    rarity: "common",
    weight: 2000,
    stackable: false,
    decayable: false,
    droppable: true,
    usable: true,
    tradable: true,
  },
];

if (typeof exports !== "undefined") {
  exports("ITEMS", ITEMS);
}
