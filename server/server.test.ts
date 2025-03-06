global.on = jest.fn();
global.GetCurrentResourceName = jest.fn().mockReturnValue("brz-inventory");
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
  {
    id: "fish",
    name: "Fish",
    type: "food",
    description:
      "A slippery friend from the sea, perfect for a quick snack or a smelly prank.",
    tier: 1,
    rarity: "common",
    weight: 2000,
    stackable: false,
    decayable: false,
    droppable: true,
    usable: true,
    onUseHandler: "consumeFish",
    tradable: true,
  },
  {
    id: "invalid",
    name: "Invalid Item",
    type: "invalid",
    description: "An item with invalid type.",
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

import { Item, ItemId } from "@common/types";
import { onResourceStart } from "./server";
import { registerItem } from "./inventory-server.service";

jest.mock("./commands", () => ({}));

jest.mock("./inventory-server.service", () => ({
  registerItem: jest.fn(),
}));

describe("Server", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const validItem = {
    id: "test" as ItemId,
    name: "Test Item",
    type: "weapon",
    description: "A test item",
    tier: 1,
    rarity: "common",
    weight: 1,
    stackable: true,
    decayable: false,
    decayChance: 100,
    decayInterval: 1000,
    decayThreshold: 0,
    decayedItem: "test" as ItemId,
    droppable: true,
    groundObject: "hei_prop_hei_paper_bag",
    usable: false,
    initialDurability: 100,
    tradable: false,
  } as Item;

  describe("Register events", () => {
    it("should register to onResourceStart event", () => {
      expect(on).toHaveBeenCalledWith("onResourceStart", onResourceStart);
    });
  });

  describe("onResourceStart", () => {
    const consoleLog = jest.spyOn(global.console, "log");
    const consoleError = jest.spyOn(global.console, "error");

    beforeEach(() => {
      consoleLog.mockClear();
    });

    it("should log a translated message when the resource starting is brz-inventory", async () => {
      await onResourceStart("brz-inventory");

      expect(consoleLog).toHaveBeenCalledWith("BRZ Inventory system started");
      expect(GetCurrentResourceName).toHaveBeenCalled();
    });

    it("should not log a message when the resource starting is not brz-inventory", () => {
      onResourceStart("brz-core");
      expect(consoleLog).not.toHaveBeenCalled();
    });

    it("should register items from the ITEMS global array", async () => {
      (registerItem as jest.Mock).mockResolvedValueOnce({});
      (registerItem as jest.Mock).mockResolvedValueOnce({});

      await onResourceStart("brz-inventory");

      expect(registerItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "crowbar",
          name: "Crowbar",
          type: "weapon",
          description:
            "A trusty tool for prying things open, or for when you just need to make a point.",
        })
      );
      expect(registerItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "fish",
          name: "Fish",
          type: "food",
          description:
            "A slippery friend from the sea, perfect for a quick snack or a smelly prank.",
        })
      );

      expect(registerItem).toHaveBeenCalledTimes(3);
    });

    it("should log an error if an item fails to register", async () => {
      (registerItem as jest.Mock).mockResolvedValueOnce({});
      (registerItem as jest.Mock).mockResolvedValueOnce({});
      (registerItem as jest.Mock).mockRejectedValueOnce(
        new Error("Invalid item type")
      );

      await onResourceStart("brz-inventory");

      expect(consoleError).toHaveBeenCalledWith(
        "Failed to register item invalid: Invalid item type"
      );
    });
  });
});
