global.on = jest.fn();
global.GetCurrentResourceName = jest.fn().mockReturnValue("brz-inventory");

import { InventoryItem, ItemId } from "@common/types";
import { createItem, onResourceStart } from "./server";
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

    beforeEach(() => {
      consoleLog.mockClear();
    });

    it("should log a translated message when the resource starting is brz-inventory", () => {
      onResourceStart("brz-inventory");

      expect(consoleLog).toHaveBeenCalledWith("BRZ Inventory system started");
      expect(GetCurrentResourceName).toHaveBeenCalled();
    });

    it("should not log a message when the resource starting is not brz-inventory", () => {
      onResourceStart("brz-core");
      expect(consoleLog).not.toHaveBeenCalled();
    });
  });

  it("should create a new item", async () => {
    expect(await createItem(validItem)).toEqual(validItem);
    expect(persistItem).toHaveBeenCalledWith(validItem);
  });

  describe("Required params", () => {
    test.each(["id", "name", "type", "description", "tier"])(
      "should throw an error if %s is missing",
      async (param) => {
        const invalidItem = { ...validItem, [param]: undefined };
        await expect(createItem(invalidItem)).rejects.toThrow(
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
        await expect(createItem(invalidItem)).rejects.toThrow(
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
      await expect(createItem(validDecayableItem)).resolves.not.toThrow();
    });
  });

  describe("Droppable items", () => {
    it("should throw an error if droppable and groundObject is missing", async () => {
      const invalidItem = {
        ...validItem,
        droppable: true,
        groundObject: undefined,
      };
      await expect(createItem(invalidItem)).rejects.toThrow(
        "Droppable items require a groundObject"
      );
    });

    it("should not throw an error if not droppable", async () => {
      const validNonDroppableItem = {
        ...validItem,
        droppable: false,
        groundObject: undefined,
      };
      await expect(createItem(validNonDroppableItem)).resolves.not.toThrow();
    });
  });

  describe("Usable items", () => {
    it("should throw an error if usable and onUseHandler is missing", async () => {
      const invalidItem = {
        ...validItem,
        usable: true,
        onUseHandler: undefined,
      };
      await expect(createItem(invalidItem)).rejects.toThrow(
        "Usable items require an onUseHandler"
      );
    });

    it("should not throw an error if not usable", async () => {
      const validNonUsableItem = {
        ...validItem,
        usable: false,
        onUseHandler: undefined,
      };
      await expect(createItem(validNonUsableItem)).resolves.not.toThrow();
    });
  });

  describe("Item tier", () => {
    test.each([0, 6])("should throw an error if tier is %i", async (tier) => {
      const invalidItem = { ...validItem, tier } as InventoryItem;
      await expect(createItem(invalidItem)).rejects.toThrow(
        "Item tier must be between 1 and 5"
      );
    });

    test.each([1, 2, 3, 4, 5])(
      "should not throw an error if tier is %i",
      async (tier) => {
        const validTierItem = { ...validItem, tier } as InventoryItem;
        await expect(createItem(validTierItem)).resolves.not.toThrow();
      }
    );
  });

  describe("Item rarity", () => {
    it("should throw an error if rarity is invalid", async () => {
      const invalidItem = {
        ...validItem,
        rarity: "invalid" as any,
      } as InventoryItem;
      await expect(createItem(invalidItem)).rejects.toThrow(
        "Invalid item rarity"
      );
    });

    it("should not throw an error if rarity is valid", async () => {
      const validRarityItem = {
        ...validItem,
        rarity: "common",
      } as InventoryItem;
      await expect(createItem(validRarityItem)).resolves.not.toThrow();
    });
  });

  describe("Item type", () => {
    it("should throw an error if type is invalid", async () => {
      const invalidItem = {
        ...validItem,
        type: "invalid" as any,
      } as InventoryItem;
      await expect(createItem(invalidItem)).rejects.toThrow(
        "Invalid item type"
      );
    });

    it("should not throw an error if type is valid", async () => {
      const validTypeItem = {
        ...validItem,
        type: "weapon",
      } as InventoryItem;
      await expect(createItem(validTypeItem)).resolves.not.toThrow();
    });
  });
});
