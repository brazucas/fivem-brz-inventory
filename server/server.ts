declare const ITEMS: Item[];

import { Item } from "@common/types";
import { registerItem } from "./inventory-server.service";
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
