import { InventoryItem } from "@common/types";

const itemIdIndex: { [id: string]: InventoryItem } = {};

export const createItem = async (
  item: InventoryItem
): Promise<InventoryItem> => {
  itemIdIndex[item.id] = item;
  return item;
};

export const getItem = (id: string): InventoryItem | undefined => {
  return itemIdIndex[id];
};
