global.on = jest.fn();
global.getPlayers = jest.fn();
global.GetPlayerName = jest.fn();

import { InventoryId, InventoryItem, Item, ItemId } from "@common/types";
import {
  registerItem,
  getItem,
  upsertInventoryItem,
  removeInventoryItem,
} from "./inventory-server.service";
import {
  getItem as getItemStore,
  registerItem as registerItemStore,
  upsertInventoryItem as upsertInventoryItemStore,
  subtractInventoryItem as subtractInventoryItemStore,
  getInventoryItem as getInventoryItemStore,
  listInventoryItems,
} from "./adapters/memory.storage";
import { emitNetTyped } from "@core/helpers/cfx";

jest.mock("./adapters/memory.storage", () => ({
  registerItem: jest.fn(),
  getItem: jest.fn(),
  upsertInventoryItem: jest.fn(),
  getInventoryItem: jest.fn(),
  subtractInventoryItem: jest.fn(),
  listInventoryItems: jest.fn(),
}));

jest.mock("@core/helpers/cfx", () => ({
  emitNetTyped: jest.fn(),
}));

describe("Server", () => {
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
    decayValue: 1,
    decayChance: 100,
    decayInterval: 1000,
    decayThreshold: 1,
    decayedItem: "test" as ItemId,
    droppable: true,
    groundObject: "hei_prop_hei_paper_bag",
    usable: false,
    initialDurability: 100,
    tradable: false,
  } as Item;

  const positiveIntegerParamTests = [-1, 0, null, "string"];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createItem", () => {
    it("should create a new item", async () => {
      expect(await registerItem(validItem)).toEqual(validItem);
      expect(registerItemStore).toHaveBeenCalledWith(validItem);
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

    describe("item param value type validation", () => {
      describe.each([
        "decayValue",
        "decayInterval",
        "decayChance",
        "decayThreshold",
        "weight",
        "tier",
      ])("%s", (param) => {
        test.each(positiveIntegerParamTests)(
          `should throw error when ${param} is %s`,
          async (paramValue) => {
            const invalidItem = { ...validItem, [param]: paramValue } as Item;
            await expect(registerItem(invalidItem)).rejects.toThrow(
              `Item ${param} must be a positive integer`
            );
          }
        );
      });
    });

    describe("Decayable items", () => {
      test.each([
        "decayChance",
        "decayInterval",
        "decayThreshold",
        "decayedItem",
      ] as (keyof Item)[])(
        "should throw an error if decayable is true and %s is missing",
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
          decayThreshold: 1,
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
      test.each([6, 7, 8])(
        "should throw an error if tier is %i",
        async (tier) => {
          const invalidItem = { ...validItem, tier } as Item;
          await expect(registerItem(invalidItem)).rejects.toThrow(
            "Item tier must be between 1 and 5"
          );
        }
      );

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

  describe("getItem", () => {
    it("should get previously registered item", () => {
      (getItemStore as jest.Mock).mockReturnValueOnce({});

      getItem("fake-id");

      expect(getItemStore).toHaveBeenCalledTimes(1);
      expect(getItemStore).toHaveBeenCalledWith("fake-id");
    });
  });

  describe("upsertInventoryItem", () => {
    const inventoryItem = {
      durability: 100,
      id: "fake-id",
      inventoryId: "fake-inventory-id" as InventoryId,
      itemId: "fake-item-id" as ItemId,
      quantity: 1,
    } as InventoryItem;
    describe("successful scenarios", () => {
      afterEach(() => {
        expect(upsertInventoryItemStore).toHaveBeenCalledTimes(1);
        expect(upsertInventoryItemStore).toHaveBeenCalledWith(inventoryItem);
      });

      it("should create inventory item and persist its state when item is valid", async () => {
        (getItemStore as jest.Mock).mockReturnValueOnce({});
        await upsertInventoryItem(inventoryItem);
      });
    });

    describe("error scenarios", () => {
      afterEach(() => {
        expect(upsertInventoryItemStore).not.toHaveBeenCalled();
      });

      it("should throw error when trying to create inventory item when it's not registered", async () => {
        (getItemStore as jest.Mock).mockReturnValueOnce(null);

        const inventoryItem = {
          durability: 100,
          id: "fake-id",
          inventoryId: "fake-inventory-id" as InventoryId,
          itemId: "fake-item-id" as ItemId,
          quantity: 1,
        } as InventoryItem;

        await expect(upsertInventoryItem(inventoryItem)).rejects.toThrow(
          `Item not registered: fake-item-id`
        );
      });

      describe("quantity validation", () => {
        test.each(positiveIntegerParamTests)(
          "should throw error when item quantity is %s",
          async (quantity: any) => {
            (getItemStore as jest.Mock).mockReturnValueOnce({});

            await expect(
              upsertInventoryItem({
                ...inventoryItem,
                quantity,
              })
            ).rejects.toThrow("Quantity must be a number greater than 0");
          }
        );
      });

      describe("durability validation", () => {
        test.each([...positiveIntegerParamTests, 101])(
          "should throw error when item durability is %s",
          async (durability: any) => {
            (getItemStore as jest.Mock).mockReturnValueOnce({});

            await expect(
              upsertInventoryItem({
                ...inventoryItem,
                durability,
              })
            ).rejects.toThrow("Durability must be a number between 1 and 100");
          }
        );
      });
    });
  });

  describe("removeInventoryItem", () => {
    const inventoryId = "fake-inventory-id" as InventoryId;
    const itemId = "fake-item-id" as ItemId;
    const quantity = 1;

    const inventoryItem = {
      durability: 100,
      id: "fake-id",
      inventoryId,
      itemId,
      quantity: 1,
    } as InventoryItem;

    it("should get item and remove quantity from inventory", async () => {
      (getInventoryItemStore as jest.Mock).mockReturnValueOnce(inventoryItem);
      (subtractInventoryItemStore as jest.Mock).mockReturnValueOnce(true);

      await removeInventoryItem(inventoryId, itemId, quantity);

      expect(getInventoryItemStore as jest.Mock).toHaveBeenCalledTimes(1);
      expect(subtractInventoryItemStore).toHaveBeenCalledTimes(1);

      expect(getInventoryItemStore).toHaveBeenCalledWith(inventoryId, itemId);
      expect(subtractInventoryItemStore).toHaveBeenCalledWith(
        inventoryId,
        itemId,
        quantity
      );
    });

    it("should throw error when item is not found in inventory", async () => {
      (getInventoryItemStore as jest.Mock).mockReturnValueOnce(null);

      await expect(
        removeInventoryItem(inventoryId, itemId, quantity)
      ).rejects.toThrow(`Item not found in inventory: ${itemId}`);

      expect(subtractInventoryItemStore).not.toHaveBeenCalled();
    });

    it("should throw error when item is not removed from inventory", async () => {
      (getInventoryItemStore as jest.Mock).mockReturnValueOnce(inventoryItem);
      (subtractInventoryItemStore as jest.Mock).mockReturnValueOnce(false);

      await expect(
        removeInventoryItem(inventoryId, itemId, quantity)
      ).rejects.toThrow("Failed to remove item from inventory");
    });

    it("should emit event to sync player inventory state when inventory id starts with player_", async () => {
      (getItem as jest.Mock).mockReturnValueOnce({});
      (getPlayers as jest.Mock).mockReturnValueOnce(["10"]);
      (GetPlayerName as jest.Mock).mockReturnValueOnce("fake-name");
      (listInventoryItems as jest.Mock).mockReturnValueOnce([inventoryItem]);

      await upsertInventoryItem({
        ...inventoryItem,
        inventoryId: "player_fake-name" as InventoryId,
      });

      expect(emitNetTyped).toHaveBeenCalledWith("brz-inventory:setState", 10, {
        0: inventoryItem,
      });
    });
  });
});
