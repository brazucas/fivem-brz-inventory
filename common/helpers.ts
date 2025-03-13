import { Item } from "./types";

declare let ITEMS: Item[];

export const getItemInfo = (itemId: string): Item | null =>
  ITEMS.find((item) => item.id === itemId) || null;
