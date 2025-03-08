import { InventoryId, InventoryItem, Item, ItemId } from "@common/types";
import {
  registerItem,
  getItem,
  createInventoryItem,
  listInventoryItems,
  deleteInventoryItem,
  getInventoryItem,
  inventoryExists,
} from "./memory.storage";

describe("MemoryStorage", () => {
  const props = {
    id: "test" as ItemId,
    name: "Test Item",
    type: "weapon",
    description: "A test item",
    tier: 1,
    rarity: "common",
    weight: 1,
    stackable: true,
    decayable: false,
    droppable: true,
    groundObject: "hei_prop_hei_paper_bag",
    usable: false,
    initialDurability: 100,
    tradable: false,
  } as Item;

  const inventoryItem = {
    durability: 100,
    id: "fake-id",
    inventoryId: "fake-inventory-id" as InventoryId,
    itemId: "fake-item-id" as ItemId,
    quantity: 1,
  } as InventoryItem;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("registerItem", () => {
    it("should store a new item", async () => {
      const item = await registerItem(props);
      expect(item).toEqual(props);
    });
  });

  describe("getItem", () => {
    it("should retriave a stored item", async () => {
      const item = await registerItem(props as Item);
      expect(getItem("test")).toEqual(props);
    });

    it("should return null when item doesn't exist", async () => {
      expect(getItem("random-id")).toBeNull();
    });
  });

  describe("createInventoryItem", () => {
    it("should store inventory item", async () => {
      const storedItem = await createInventoryItem(inventoryItem);

      expect(storedItem).toEqual(inventoryItem);
    });
  });

  describe("listInventoryItems", () => {
    it("should return list of inventory items previously registered for inventory id", async () => {
      const item1 = {
        ...inventoryItem,
        itemId: "item-id-1" as ItemId,
      };

      const item2 = {
        ...inventoryItem,
        itemId: "item-id-2" as ItemId,
      };

      await createInventoryItem(item1);
      await createInventoryItem(item2);

      expect(await listInventoryItems(inventoryItem.inventoryId)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            itemId: "item-id-1",
          }),
          expect.objectContaining({
            itemId: "item-id-2",
          }),
        ])
      );
    });

    it("should return empty array when inventory doesn't exist", async () => {
      expect(
        await listInventoryItems("random-inventory-id" as InventoryId)
      ).toEqual([]);
    });
  });

  describe("deleteInventoryItem", () => {
    it("should subtract inventory item quantity and return true when item exists and has enough quantity to subtract", async () => {
      const item = {
        ...inventoryItem,
        quantity: 2,
      };

      await createInventoryItem(item);

      expect(
        await deleteInventoryItem(item.inventoryId, item.itemId, 1)
      ).toBeTruthy();

      expect(await getInventoryItem(item.inventoryId, item.itemId)).toEqual(
        expect.objectContaining({
          quantity: 1,
        })
      );
    });

    it("should return false when item doesn't exist", async () => {
      expect(
        await deleteInventoryItem(
          "random-inventory-id" as InventoryId,
          "random-item-id" as ItemId,
          1
        )
      ).toBeFalsy();
    });

    it("should delete item when quantity is 0", async () => {
      const item = {
        ...inventoryItem,
        quantity: 1,
      };

      await createInventoryItem(item);

      expect(
        await deleteInventoryItem(item.inventoryId, item.itemId, 1)
      ).toBeTruthy();

      expect(await getInventoryItem(item.inventoryId, item.itemId)).toBeNull();
    });
  });

  describe("getInventoryItem", () => {
    it("should return inventory item when it exists", async () => {
      await createInventoryItem(inventoryItem);

      expect(
        await getInventoryItem(inventoryItem.inventoryId, inventoryItem.itemId)
      ).toEqual(inventoryItem);
    });

    it("should return null when inventory item doesn't exist", async () => {
      expect(
        await getInventoryItem(
          "random-inventory-id" as InventoryId,
          "random-item-id" as ItemId
        )
      ).toBeNull();
    });
  });

  describe("inventoryExists", () => {
    it("should return true when inventory exists", async () => {
      await createInventoryItem(inventoryItem);

      expect(await inventoryExists(inventoryItem.inventoryId)).toBeTruthy();
    });

    it("should return false when inventory doesn't exist", async () => {
      expect(
        await inventoryExists("random-inventory-id" as InventoryId)
      ).toBeFalsy();
    });
  });
});
