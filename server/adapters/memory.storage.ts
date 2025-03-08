import { InventoryItem, InventoryItems, Item } from "@common/types";

const itemIdIndex: { [id: string]: Item } = {};

const inventoryItemsStore: InventoryItems = {};

export const registerItem = async (item: Item): Promise<Item> => {
  itemIdIndex[item.id] = item;
  return item;
};

export const getItem = (id: string): Item | null => itemIdIndex[id] || null;

export const createInventoryItem = async (inventoryItem: InventoryItem) => {
  if (!inventoryItemsStore[inventoryItem.inventoryId]) {
    inventoryItemsStore[inventoryItem.inventoryId] = [];
  }

  inventoryItemsStore[inventoryItem.inventoryId].push(inventoryItem);

  return inventoryItem;
};
