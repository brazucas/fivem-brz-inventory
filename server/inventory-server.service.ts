import {
  InventoryId,
  InventoryItem,
  Item,
  ItemDefaults,
  ItemId,
  ItemRarity,
  ItemType,
  RemoveItemOperationResult,
} from "@common/types";
import {
  getItem,
  registerItem as persistItem,
  createInventoryItem as createInventoryItemStore,
  getInventoryItem,
  subtractInventoryItem,
} from "./adapters/memory.storage";

export const registerItem = async (item: Partial<Item>): Promise<Item> => {
  const newItem = {
    ...ItemDefaults,
    ...item,
  } as Item;

  validateRequiredParams(newItem);
  validatePositiveIntegerParams(newItem);
  validateDecayableItem(newItem);
  validateDroppableItem(newItem);
  validateUsableItem(newItem);
  validateItemTier(newItem.tier);
  validateItemRarity(newItem.rarity);
  validateItemType(newItem.type);

  await persistItem(newItem);

  return newItem;
};

export const createInventoryItem = async (
  inventoryItem: InventoryItem
): Promise<InventoryItem> => {
  const item = getItem(inventoryItem.itemId);

  const updatedInventoryItem = {
    ...inventoryItem,
  };

  if (!item) {
    throw new Error(`Item not registered: ${inventoryItem.itemId}`);
  }

  if (inventoryItem.quantity < 1 || isNaN(inventoryItem.quantity)) {
    throw new Error("Quantity must be a number greater than 0");
  }

  if (
    inventoryItem.durability < 1 ||
    isNaN(inventoryItem.durability) ||
    inventoryItem.durability > 100
  ) {
    throw new Error("Durability must be a number between 1 and 100");
  }

  if (inventoryItem.quantity > 1 && !item.stackable) {
    console.warn(
      `Attempting to give multiple non-stackable items: ${inventoryItem.itemId}. Only one will be added.`
    );
    updatedInventoryItem.quantity = 1;
  }

  await createInventoryItemStore(updatedInventoryItem);

  return updatedInventoryItem;
};

export const removeInventoryItem = async (
  inventoryId: InventoryId,
  itemId: ItemId,
  quantity: number
): Promise<RemoveItemOperationResult> => {
  const storedInventoryItem = await getInventoryItem(inventoryId, itemId);

  if (!storedInventoryItem) {
    throw new Error(`Item not found in inventory: ${itemId}`);
  }

  const deleted = await subtractInventoryItem(inventoryId, itemId, quantity);

  if (!deleted) {
    throw new Error("Failed to remove item from inventory");
  }

  return {
    success: true,
    remainingQuantity: storedInventoryItem.quantity - quantity,
    removedAll: storedInventoryItem.quantity - quantity === 0,
  };
};

const validateRequiredParams = (item: Partial<Item>) => {
  const requiredParams: (keyof Item)[] = [
    "id",
    "name",
    "type",
    "description",
    "tier",
  ];

  for (const param of requiredParams) {
    if (item[param] === undefined) {
      throw new Error(`Missing required parameter: ${param}`);
    }
  }
};

const validateDecayableItem = (item: Partial<Item>) => {
  if (
    item.decayable &&
    (item.decayChance === undefined ||
      item.decayInterval === undefined ||
      item.decayThreshold === undefined ||
      item.decayedItem === undefined)
  ) {
    throw new Error(
      "Decayable items require decayChance, decayInterval, decayThreshold, and decayedItem"
    );
  }
};

const validateDroppableItem = (item: Partial<Item>) => {
  if (item.droppable && !item.groundObject) {
    throw new Error("Droppable items require a groundObject");
  }
};

const validateUsableItem = (item: Partial<Item>) => {
  if (item.usable && !item.onUseHandler) {
    throw new Error("Usable items require an onUseHandler");
  }
};

const validateItemTier = (tier: number) => {
  if (tier < 1 || tier > 5) {
    throw new Error("Item tier must be between 1 and 5");
  }
};

const validateItemRarity = (rarity: keyof typeof ItemRarity) => {
  if (Object.values(ItemRarity).indexOf(rarity) === -1) {
    throw new Error("Invalid item rarity");
  }
};

const validateItemType = (type: keyof typeof ItemType) => {
  if (Object.values(ItemType).indexOf(type) === -1) {
    throw new Error("Invalid item type");
  }
};

const validatePositiveIntegerParams = (item: Partial<Item>) => {
  const positiveIntegerParams: (keyof Item)[] = [
    "decayValue",
    "decayInterval",
    "decayChance",
    "decayThreshold",
    "weight",
    "tier",
  ];

  for (const param of positiveIntegerParams) {
    const value = item[param] as any;

    if (typeof item[param] !== "undefined" && (isNaN(value) || value < 1)) {
      throw new Error(`Item ${param} must be a positive integer`);
    }
  }
};

export { getItem };
