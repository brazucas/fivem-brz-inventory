import {
  InventoryId,
  InventoryItem,
  InventoryItems,
  Item,
  ItemId,
} from "@common/types";

const itemIdIndex: { [id: string]: Item } = {};

const inventoryItemsStore: InventoryItems = {};

export const registerItem = async (item: Item): Promise<Item> => {
  itemIdIndex[item.id] = item;
  return item;
};

export const getItem = (id: string): Item | null => itemIdIndex[id] || null;

export const createInventoryItem = async (inventoryItem: InventoryItem) => {
  if (!inventoryItemsStore[inventoryItem.inventoryId]) {
    inventoryItemsStore[inventoryItem.inventoryId] = {};
  }

  inventoryItemsStore[inventoryItem.inventoryId]![inventoryItem.itemId] =
    inventoryItem;

  return inventoryItem;
};

export const listInventoryItems = async (
  inventoryId: InventoryId
): Promise<InventoryItems[]> => {
  if (!inventoryItemsStore[inventoryId]) {
    return [];
  }

  return Object.values(inventoryItemsStore[inventoryId]!);
};

export const deleteInventoryItem = async (
  inventoryId: InventoryId,
  itemId: ItemId,
  quantity: number
): Promise<boolean> => {
  const storedInventoryItem = await getInventoryItem(inventoryId, itemId);

  if (!storedInventoryItem) {
    return false;
  }

  if (storedInventoryItem.quantity - quantity <= 0) {
    delete inventoryItemsStore[inventoryId]?.[itemId];
    return true;
  }

  inventoryItemsStore[inventoryId]![itemId].quantity -= quantity;
  return true;
};

export const getInventoryItem = async (
  inventoryId: InventoryId,
  itemId: ItemId
): Promise<InventoryItem | null> =>
  inventoryItemsStore[inventoryId]?.[itemId] || null;
