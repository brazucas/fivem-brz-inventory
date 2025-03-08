import {
  InventoryItem,
  Item,
  ItemDefaults,
  ItemRarity,
  ItemType,
} from "@common/types";
import {
  getItem,
  registerItem as persistItem,
  createInventoryItem as createInventoryItemStore,
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
