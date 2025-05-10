declare const ITEMS: Item[];
declare const SETTINGS: Settings;

import {
  Item,
  ItemDefaults,
  ItemId,
  ItemType,
  QSInventoryItem,
  Settings,
  ThirdPartyInventory,
} from "@common/types";
import { registerItem } from "./inventory.service";
import "./commands";

const registerInventoryFunctions: {
  [key in ThirdPartyInventory]: () => Promise<void>;
} = {
  "qs-inventory": () => registerQsInventoryItems(),
};

export const onResourceStart = async (resName: string) => {
  if (resName === GetCurrentResourceName()) {
    await registerItems();

    if (SETTINGS.loadThirdPartyInventory) {
      await registerInventoryFunctions[SETTINGS.loadThirdPartyInventory]();
    }

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

const registerQsInventoryItems = async () => {
  const itemList = exports["qs-inventory"].GetItemList() as {
    [key: string]: QSInventoryItem;
  };

  const itemKeys = Object.keys(itemList);

  for (const itemKey of itemKeys) {
    const item = itemList[itemKey];

    const itemType =
      ItemType[item.type as keyof typeof ItemType] || ItemType.misc;

    const itemWeight = item.weight || 1;

    const itemDescription = item.description || "No description available";

    const newItem = {
      id: item.name as ItemId,
      name: item.name,
      type: itemType,
      rarity: "common",
      description: itemDescription,
      tier: 1,
      weight: itemWeight,
      stackable: true,
      droppable: false,
      groundObject: ItemDefaults.groundObject,
      onUseHandler: `qs-inventory:${item.name}`,
      usable: item.useable,
      initialDurability: ItemDefaults.initialDurability,
      decayable: ItemDefaults.decayable,
      decayValue: ItemDefaults.decayValue,
      decayInterval: ItemDefaults.decayInterval,
      decayChance: ItemDefaults.decayChance,
      decayThreshold: ItemDefaults.decayThreshold,
      decayedItem: ItemDefaults.decayedItem,
      tradable: false,
    } as Item;

    try {
      await registerItem(newItem);
    } catch (e: any) {
      console.error(
        `Failed to register QS Inventory item ${item.name}: ${e.message}`
      );
    }
  }

  console.log(`Registered ${itemKeys.length} items from QS Inventory`);
};
