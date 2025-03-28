import {
  Inventory,
  InventoryId,
  InventoryItem,
  InventoryItems,
  Item,
  ItemId,
} from "@common/types";
import { randomUUID } from "crypto";

const itemIdIndex: { [id: string]: Item } = {};

const inventoryStore: {
  [inventoryId: string]: Inventory;
} = {};

export const registerItem = async (item: Item): Promise<Item> => {
  itemIdIndex[item.id] = item;
  return item;
};

export const getItem = (id: string): Item | null => itemIdIndex[id] || null;

export const upsertInventoryItem = async (inventoryItem: InventoryItem) => {
  if (!inventoryStore[inventoryItem.inventoryId]) {
    inventoryStore[inventoryItem.inventoryId] = {
      id: randomUUID(),
      type: "player",
      maxWeight: 1000,
      maxItems: 1000,
      items: {} as InventoryItems,
      metadata: {},
    };
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
