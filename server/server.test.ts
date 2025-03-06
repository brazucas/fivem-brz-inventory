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

import { InventoryItem, ItemId } from "@common/types";
import { registerItem, onResourceStart } from "./server";
import { createItem as persistItem } from "./adapters/memory.storage";

jest.mock("./adapters/memory.storage", () => ({
  createItem: jest.fn(),
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
    durability: 100,
    tradable: false,
  } as InventoryItem;

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

    it("should persist items from the ITEMS global array", async () => {
      await onResourceStart("brz-inventory");
      expect(persistItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "crowbar",
          name: "Crowbar",
          type: "weapon",
          description:
            "A trusty tool for prying things open, or for when you just need to make a point.",
        })
      );
      expect(persistItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "fish",
          name: "Fish",
          type: "food",
          description:
            "A slippery friend from the sea, perfect for a quick snack or a smelly prank.",
        })
      );

      expect(persistItem).toHaveBeenCalledTimes(2);
    });

    it("should log an error if an item fails to register", async () => {
      await onResourceStart("brz-inventory");
      expect(consoleError).toHaveBeenCalledWith(
        "Failed to register item invalid: Invalid item type"
      );
    });
  });

  it("should create a new item", async () => {
    expect(await registerItem(validItem)).toEqual(validItem);
    expect(persistItem).toHaveBeenCalledWith(validItem);
  });

  describe("Required params", () => {
    test.each(["id", "name", "type", "description", "tier"])(
      "should throw an error if %s is missing",
      async (param) => {
        const invalidItem = { ...validItem, [param]: undefined };
        await expect(registerItem(invalidItem)).rejects.toThrow(
          `Missing required parameter: ${param}`
        );
      }
    );
  });

  describe("Decayable items", () => {
    test.each([
      "decayChance",
      "decayInterval",
      "decayThreshold",
      "decayedItem",
    ])(
      "should throw an error if decayable and %s is missing",
      async (paramToInvalidate) => {
        const invalidItem = {
          ...validItem,
          decayable: true,
          [paramToInvalidate]: undefined,
        };
        await expect(registerItem(invalidItem)).rejects.toThrow(
          "Decayable items require decayChance, decayInterval, decayThreshold, and decayedItem"
        );
      }
    );

    it("should not throw an error if decayable and all decay params are present", async () => {
      const validDecayableItem = {
        ...validItem,
        decayable: true,
        decayChance: 100,
        decayInterval: 1000,
        decayThreshold: 0,
        decayedItem: "test" as ItemId,
      };
      await expect(registerItem(validDecayableItem)).resolves.not.toThrow();
    });
  });

  describe("Droppable items", () => {
    it("should throw an error if droppable and groundObject is missing", async () => {
      const invalidItem = {
        ...validItem,
        droppable: true,
        groundObject: undefined,
      };
      await expect(registerItem(invalidItem)).rejects.toThrow(
        "Droppable items require a groundObject"
      );
    });

    it("should not throw an error if not droppable", async () => {
      const validNonDroppableItem = {
        ...validItem,
        droppable: false,
        groundObject: undefined,
      };
      await expect(registerItem(validNonDroppableItem)).resolves.not.toThrow();
    });
  });

  describe("Usable items", () => {
    it("should throw an error if usable and onUseHandler is missing", async () => {
      const invalidItem = {
        ...validItem,
        usable: true,
        onUseHandler: undefined,
      };
      await expect(registerItem(invalidItem)).rejects.toThrow(
        "Usable items require an onUseHandler"
      );
    });

    it("should not throw an error if not usable", async () => {
      const validNonUsableItem = {
        ...validItem,
        usable: false,
        onUseHandler: undefined,
      };
      await expect(registerItem(validNonUsableItem)).resolves.not.toThrow();
    });
  });

  describe("Item tier", () => {
    test.each([0, 6])("should throw an error if tier is %i", async (tier) => {
      const invalidItem = { ...validItem, tier } as InventoryItem;
      await expect(registerItem(invalidItem)).rejects.toThrow(
        "Item tier must be between 1 and 5"
      );
    });

    test.each([1, 2, 3, 4, 5])(
      "should not throw an error if tier is %i",
      async (tier) => {
        const validTierItem = { ...validItem, tier } as InventoryItem;
        await expect(registerItem(validTierItem)).resolves.not.toThrow();
      }
    );
  });

  describe("Item rarity", () => {
    it("should throw an error if rarity is invalid", async () => {
      const invalidItem = {
        ...validItem,
        rarity: "invalid" as any,
      } as InventoryItem;
      await expect(registerItem(invalidItem)).rejects.toThrow(
        "Invalid item rarity"
      );
    });

    it("should not throw an error if rarity is valid", async () => {
      const validRarityItem = {
        ...validItem,
        rarity: "common",
      } as InventoryItem;
      await expect(registerItem(validRarityItem)).resolves.not.toThrow();
    });
  });

  describe("Item type", () => {
    it("should throw an error if type is invalid", async () => {
      const invalidItem = {
        ...validItem,
        type: "invalid" as any,
      } as InventoryItem;
      await expect(registerItem(invalidItem)).rejects.toThrow(
        "Invalid item type"
      );
    });

    it("should not throw an error if type is valid", async () => {
      const validTypeItem = {
        ...validItem,
        type: "weapon",
      } as InventoryItem;
      await expect(registerItem(validTypeItem)).resolves.not.toThrow();
    });
  });
});
