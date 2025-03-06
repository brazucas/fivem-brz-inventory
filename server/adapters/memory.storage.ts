import { Item } from "@common/types";

const itemIdIndex: { [id: string]: Item } = {};

export const createItem = async (item: Item): Promise<Item> => {
  itemIdIndex[item.id] = item;
  return item;
};

export const getItem = (id: string): Item | undefined => {
  return itemIdIndex[id];
};
