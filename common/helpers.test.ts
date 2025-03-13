(global as any).ITEMS = [
  {
    id: "crowbar",
    name: "Crowbar",
    type: "weapon",
    description:
      "A trusty tool for prying things open, or for when you just need to make a point.",
    tier: 1,
    rarity: "common",
    weight: 2000,
    stackable: false,
    decayable: false,
    droppable: true,
    usable: true,
    onUseHandler: "useCrowbar",
    tradable: true,
  },
];

import { getItemInfo } from "./helpers";

describe("helpers", () => {
  describe("getItemInfo", () => {
    it("should return null if item doesn't exist", () => {
      expect(getItemInfo("nonexistent")).toBeNull();
    });

    it("should return item if it exists", () => {
      expect(getItemInfo("crowbar")).toEqual({
        id: "crowbar",
        name: "Crowbar",
        type: "weapon",
        description:
          "A trusty tool for prying things open, or for when you just need to make a point.",
        tier: 1,
        rarity: "common",
        weight: 2000,
        stackable: false,
        decayable: false,
        droppable: true,
        usable: true,
        onUseHandler: "useCrowbar",
        tradable: true,
      });
    });
  });
});
