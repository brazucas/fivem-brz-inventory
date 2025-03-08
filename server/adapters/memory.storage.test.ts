import { InventoryId, InventoryItem, Item, ItemId } from "@common/types";
import { registerItem, getItem, createInventoryItem } from "./memory.storage";

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
  });

  describe("createInventoryItem", () => {
    it("should store inventory item", async () => {
      const inventoryItem = {
        durability: 100,
        id: "fake-id",
        inventoryId: "fake-inventory-id" as InventoryId,
        itemId: "fake-item-id" as ItemId,
        quantity: 1,
      } as InventoryItem;

      const storedItem = await createInventoryItem(inventoryItem);

      expect(storedItem).toEqual(inventoryItem);
    });
  });
});
