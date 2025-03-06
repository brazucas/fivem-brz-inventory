import {
  InventoryItem,
  ItemDefaults,
  ItemRarity,
  ItemType,
} from "@common/types";
import { createItem as persistItem } from "./adapters/memory.storage";

export const onResourceStart = (resName: string) => {
  if (resName === GetCurrentResourceName()) {
    console.log("BRZ Inventory system started");
  }
};

on("onResourceStart", onResourceStart);

export const createItem = async (
  item: Partial<InventoryItem>
): Promise<InventoryItem> => {
  const newItem = {
    ...ItemDefaults,
    ...item,
  } as InventoryItem;

  const requiredParams: (keyof InventoryItem)[] = [
    "id",
    "name",
    "type",
    "description",
    "tier",
  ];

  for (const param of requiredParams) {
    if (newItem[param] === undefined) {
      throw new Error(`Missing required parameter: ${param}`);
    }
  }

  if (
    newItem.decayable &&
    (item.decayChance === undefined ||
      item.decayInterval === undefined ||
      item.decayThreshold === undefined ||
      item.decayedItem === undefined)
  ) {
    throw new Error(
      "Decayable items require decayChance, decayInterval, decayThreshold, and decayedItem"
    );
  }

  if (newItem.droppable && !newItem.groundObject) {
    throw new Error("Droppable items require a groundObject");
  }

  if (newItem.usable && !newItem.onUseHandler) {
    throw new Error("Usable items require an onUseHandler");
  }

  if (newItem.tier < 1 || newItem.tier > 5) {
    throw new Error("Item tier must be between 1 and 5");
  }

  if (Object.values(ItemRarity).indexOf(newItem.rarity) === -1) {
    throw new Error("Invalid item rarity");
  }

  if (Object.values(ItemType).indexOf(newItem.type) === -1) {
    throw new Error("Invalid item type");
  }

  await persistItem(newItem);

  return newItem;
};
