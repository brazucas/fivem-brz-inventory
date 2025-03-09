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

export const upsertInventoryItem = async (inventoryItem: InventoryItem) => {
  if (!inventoryItemsStore[inventoryItem.inventoryId]) {
    inventoryItemsStore[inventoryItem.inventoryId] = {};
  }

  const existingItem = await getInventoryItem(
    inventoryItem.inventoryId,
    inventoryItem.itemId
  );

  if (existingItem) {
    const updatedItem: InventoryItem = {
      ...existingItem,
      quantity: existingItem.quantity + inventoryItem.quantity,
    };

    inventoryItemsStore[inventoryItem.inventoryId]![inventoryItem.itemId] =
      updatedItem;

    return updatedItem;
  }

  inventoryItemsStore[inventoryItem.inventoryId]![inventoryItem.itemId] =
    inventoryItem;

  return inventoryItem;
};

export const updateInventoryItem = async (
  inventoryItem: InventoryItem
): Promise<InventoryItem> => {
  const storedInventoryItem = await getInventoryItem(
    inventoryItem.inventoryId,
    inventoryItem.itemId
  );

  if (!storedInventoryItem) {
    throw new Error(
      `Item ${inventoryItem.itemId} not found in inventory ${inventoryItem.inventoryId} `
    );
  }

  const updatedInventoryItem = {
    ...storedInventoryItem,
    ...inventoryItem,
  };

  inventoryItemsStore[inventoryItem.inventoryId]![inventoryItem.itemId] =
    updatedInventoryItem;

  return updatedInventoryItem;
};

export const listInventoryItems = async (
  inventoryId: InventoryId
): Promise<InventoryItems[]> => {
  if (!inventoryItemsStore[inventoryId]) {
    return [];
  }

  return Object.values(inventoryItemsStore[inventoryId]!);
};

export const subtractInventoryItem = async (
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

export const inventoryExists = async (
  inventoryId: InventoryId
): Promise<boolean> => !!inventoryItemsStore[inventoryId];
