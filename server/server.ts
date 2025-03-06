declare const ITEMS: Item[];

import { Item, ItemDefaults, ItemRarity, ItemType } from "@common/types";
import { createItem as persistItem } from "./adapters/memory.storage";

export const onResourceStart = async (resName: string) => {
  if (resName === GetCurrentResourceName()) {
    await registerItems();
    console.log("BRZ Inventory system started");
  }
};

on("onResourceStart", onResourceStart);

const registerItems = async () => {
  for (const item of ITEMS) {
    try {
      await registerItem(item);
    } catch (e: any) {
      console.error(`Failed to register item ${item.id}: ${e.message}`);
    }
  }
};

export const registerItem = async (item: Partial<Item>): Promise<Item> => {
  const newItem = {
    ...ItemDefaults,
    ...item,
  } as Item;

  validateRequiredParams(newItem);
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
