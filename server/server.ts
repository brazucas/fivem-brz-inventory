declare const ITEMS: Item[];

import { Item } from "@common/types";
import { registerItem } from "./inventory.service";
import "./commands";

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
