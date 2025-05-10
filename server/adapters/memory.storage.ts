import { StoredInventory, StoredItem } from "@/types/storage.types";
import {
  Inventory,
  InventoryId,
  InventoryItem,
  InventoryItems,
  Item,
  ItemId,
  NewInventoryItem,
  NewItem,
} from "@common/types";
import { randomUUID } from "crypto";

const itemsStore: { [id: ItemId]: StoredItem } = {};

const inventoryStore: {
  [inventoryId: InventoryId]: StoredInventory;
} = {};

export const createItem = async (item: NewItem): Promise<Item> => {
  const id = randomUUID() as ItemId;

  const storedItem: StoredItem = {
    id,
    name: item.name,
    type: item.type,
    rarity: item.rarity,
    description: item.description,
    tier: item.tier,
    weight: item.weight,
    stackable: item.stackable,
    droppable: item.droppable,
    groundObject: item.groundObject,
    usable: item.usable,
    onUseHandler: item.onUseHandler,
    initialDurability: item.initialDurability,
    decayable: item.decayable,
    decayValue: item.decayValue,
    decayInterval: item.decayInterval,
    decayChance: item.decayChance,
    decayThreshold: item.decayThreshold,
    decayedItem: item.decayedItem,
    tradable: item.tradable,
  };

  itemsStore[id] = storedItem;

  return {
    id,
    ...item,
  };
};

export const getItem = (id: ItemId): Item | null => itemsStore[id] || null;

export const saveInventoryItem = async (
  inventoryId: InventoryId,
  inventoryItem: InventoryItem | NewInventoryItem
) => {
  if (!inventoryStore[inventoryId]) {
    throw new Error("Inventory not found");
  }

  const existingItem = await getInventoryItem(
    inventoryId,
    inventoryItem.itemId
  );

  if (existingItem) {
    const updatedItem: InventoryItem = {
      ...existingItem,
      quantity: existingItem.quantity + inventoryItem.quantity,
    };

    // inventoryStore[inventoryId].items[inventoryItem.itemId] = updatedItem;

    return updatedItem;
  }

  // inventoryStore[inventoryId].items[inventoryItem.itemId] = inventoryItem;

  return inventoryItem;
};

export const listInventoryItems = async (
  inventoryId: InventoryId
): Promise<InventoryItems[]> => {
  if (!inventoryStore[inventoryId]) {
    throw new Error("Inventory not found");
  }

  // return Object.values(inventoryStore[inventoryId].items);
  return [];
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
    // delete inventoryStore[inventoryId].items[itemId];
    return true;
  }

  // inventoryStore[inventoryId].items[itemId].quantity -= quantity;
  return true;
};

export const getInventoryItem = async (
  inventoryId: InventoryId,
  itemId: ItemId
): Promise<InventoryItem | null> => {
  if (!inventoryStore[inventoryId]) {
    throw new Error("Inventory not found");
  }

  // return inventoryStore[inventoryId].items[itemId] || null;
  return null;
};

export const inventoryExists = async (
  inventoryId: InventoryId
): Promise<boolean> => !!inventoryStore[inventoryId];
