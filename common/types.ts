export type Inventory = {
  id: string;
  maxWeight: number;
  maxItems: number;
};

export type InventoryItem = {
  id: ItemId;
  name: string;
  type: keyof typeof ItemType;
  rarity: keyof typeof ItemRarity;
  description: string;
  tier: ItemTier;
  weight: number;
  stackable: boolean;
  droppable: boolean;
  groundObject: string;
  usable: boolean;
  onUseHandler?: string;
  durability: number;
  decayable: boolean;
  decayValue?: number;
  decayInterval?: number;
  decayChance?: number;
  decayThreshold?: number;
  decayedItem?: ItemId;
  tradable: boolean;
};

export const ItemType = {
  weapon: "weapon",
  food: "food",
  tool: "tool",
  apparel: "apparel",
};

export const ItemRarity = {
  common: "common",
  uncommon: "uncommon",
  rare: "rare",
  epic: "epic",
  legendary: "legendary",
} as const;

export type ItemTier = 1 | 2 | 3 | 4 | 5;

export const ItemDefaults: Partial<InventoryItem> = {
  weight: 1,
  stackable: true,
  usable: false,
  durability: 100,
  droppable: true,
  decayable: false,
  groundObject: "hei_prop_hei_paper_bag",
  tradable: false,
  rarity: "common",
};

export type ItemId = string & { __opaque__: "ItemId" };
