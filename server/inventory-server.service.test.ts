global.on = jest.fn();

import { Item, ItemId } from "@common/types";
import { registerItem } from "./inventory-server.service";
import { registerItem as persistItem } from "./adapters/memory.storage";

jest.mock("./adapters/memory.storage", () => ({
  registerItem: jest.fn(),
}));

describe("Server", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createItem", () => {
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
        await expect(
          registerItem(validNonDroppableItem)
        ).resolves.not.toThrow();
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
        const invalidItem = { ...validItem, tier } as Item;
        await expect(registerItem(invalidItem)).rejects.toThrow(
          "Item tier must be between 1 and 5"
        );
      });

      test.each([1, 2, 3, 4, 5])(
        "should not throw an error if tier is %i",
        async (tier) => {
          const validTierItem = { ...validItem, tier } as Item;
          await expect(registerItem(validTierItem)).resolves.not.toThrow();
        }
      );
    });

    describe("Item rarity", () => {
      it("should throw an error if rarity is invalid", async () => {
        const invalidItem = {
          ...validItem,
          rarity: "invalid" as any,
        } as Item;
        await expect(registerItem(invalidItem)).rejects.toThrow(
          "Invalid item rarity"
        );
      });

      it("should not throw an error if rarity is valid", async () => {
        const validRarityItem = {
          ...validItem,
          rarity: "common",
        } as Item;
        await expect(registerItem(validRarityItem)).resolves.not.toThrow();
      });
    });

    describe("Item type", () => {
      it("should throw an error if type is invalid", async () => {
        const invalidItem = {
          ...validItem,
          type: "invalid" as any,
        } as Item;
        await expect(registerItem(invalidItem)).rejects.toThrow(
          "Invalid item type"
        );
      });

      it("should not throw an error if type is valid", async () => {
        const validTypeItem = {
          ...validItem,
          type: "weapon",
        } as Item;
        await expect(registerItem(validTypeItem)).resolves.not.toThrow();
      });
    });
});
