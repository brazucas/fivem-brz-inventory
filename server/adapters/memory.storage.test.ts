import { InventoryId, InventoryItem, Item, ItemId } from "@common/types";
import {
  registerItem,
  getItem,
  upsertInventoryItem,
  listInventoryItems,
  subtractInventoryItem,
  getInventoryItem,
  inventoryExists,
  updateInventoryItem,
} from "./memory.storage";
import { randomUUID } from "crypto";

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

  describe("upsertInventoryItem", () => {
    it("should store inventory item", async () => {
      const inventoryItem = {
        durability: 100,
        id: randomUUID(),
        inventoryId: randomUUID() as InventoryId,
        itemId: "fake-item-id" as ItemId,
        quantity: 1,
      } as InventoryItem;

      const storedItem = await upsertInventoryItem(inventoryItem);

      expect(storedItem).toEqual(inventoryItem);
    });

    it("should increment item quantity when trying to create an existing item", async () => {
      const inventoryItem = {
        durability: 100,
        id: randomUUID(),
        inventoryId: randomUUID() as InventoryId,
        itemId: "fake-item-id" as ItemId,
        quantity: 1,
      } as InventoryItem;

      await upsertInventoryItem(inventoryItem);
      await upsertInventoryItem(inventoryItem);

      const storedItem = await getInventoryItem(
        inventoryItem.inventoryId,
        inventoryItem.itemId
      );

      expect(storedItem).toBeDefined();
      expect(storedItem?.quantity).toEqual(2);
    });
  });

  describe("listInventoryItems", () => {
    it("should return list of inventory items previously registered for inventory id", async () => {
      const inventoryItem = {
        durability: 100,
        id: randomUUID(),
        inventoryId: randomUUID() as InventoryId,
        itemId: "fake-item-id" as ItemId,
        quantity: 1,
      } as InventoryItem;

      const item1 = {
        ...inventoryItem,
        itemId: "item-id-1" as ItemId,
      };

      const item2 = {
        ...inventoryItem,
        itemId: "item-id-2" as ItemId,
      };

      await upsertInventoryItem(item1);
      await upsertInventoryItem(item2);

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
      const inventoryItem = {
        durability: 100,
        id: randomUUID(),
        inventoryId: randomUUID() as InventoryId,
        itemId: "fake-item-id" as ItemId,
        quantity: 1,
      } as InventoryItem;

      const item = {
        ...inventoryItem,
        quantity: 2,
      };

      await upsertInventoryItem(item);

      expect(
        await subtractInventoryItem(item.inventoryId, item.itemId, 1)
      ).toBeTruthy();

      expect(await getInventoryItem(item.inventoryId, item.itemId)).toEqual(
        expect.objectContaining({
          quantity: 1,
        })
      );
    });

    it("should return false when item doesn't exist", async () => {
      expect(
        await subtractInventoryItem(
          "random-inventory-id" as InventoryId,
          "random-item-id" as ItemId,
          1
        )
      ).toBeFalsy();
    });

    it("should delete item when quantity is 0", async () => {
      const inventoryItem = {
        durability: 100,
        id: randomUUID(),
        inventoryId: randomUUID() as InventoryId,
        itemId: "fake-item-id" as ItemId,
        quantity: 1,
      } as InventoryItem;

      const item = {
        ...inventoryItem,
        quantity: 1,
      };

      await upsertInventoryItem(item);

      expect(
        await subtractInventoryItem(item.inventoryId, item.itemId, 1)
      ).toBeTruthy();

      expect(await getInventoryItem(item.inventoryId, item.itemId)).toBeNull();
    });
  });

  describe("getInventoryItem", () => {
    it("should return inventory item when it exists", async () => {
      const inventoryItem = {
        durability: 100,
        id: randomUUID(),
        inventoryId: randomUUID() as InventoryId,
        itemId: "fake-item-id" as ItemId,
        quantity: 1,
      } as InventoryItem;

      await upsertInventoryItem(inventoryItem);

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
      const inventoryItem = {
        durability: 100,
        id: randomUUID(),
        inventoryId: randomUUID() as InventoryId,
        itemId: "fake-item-id" as ItemId,
        quantity: 1,
      } as InventoryItem;

      await upsertInventoryItem(inventoryItem);

      expect(await inventoryExists(inventoryItem.inventoryId)).toBeTruthy();
    });

    it("should return false when inventory doesn't exist", async () => {
      expect(
        await inventoryExists("random-inventory-id" as InventoryId)
      ).toBeFalsy();
    });
  });
});
