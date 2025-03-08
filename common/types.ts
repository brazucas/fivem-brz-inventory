export type Inventory = {
  id: string;
  maxWeight: number;
  maxItems: number;
};

export type Item = {
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
  initialDurability: number;
  decayable: boolean;
  decayValue?: number;
  decayInterval?: number;
  decayChance?: number;
  decayThreshold?: number;
  decayedItem?: ItemId;
  tradable: boolean;
};

export type InventoryItem = {
  id: string;
  inventoryId: InventoryId;
  itemId: ItemId;
  quantity: number;
  durability: number;
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

export const ItemDefaults: Partial<Item> = {
  weight: 1,
  stackable: true,
  usable: false,
  initialDurability: 100,
  droppable: true,
  decayable: false,
  groundObject: "hei_prop_hei_paper_bag",
  tradable: false,
  rarity: "common",
};

export type ItemId = string & { __opaque__: "ItemId" };

export type InventoryId = string & { __opaque__: "InventoryId" };

export type PlayerId = number & { __opaque__: "PlayerId" };

export type Quantity = number & { __opaque__: "Quantity" };

export type PositionId = number & { __opaque__: "PositionId" };

export type InventoryItems = {
  [inventoryId: InventoryId]:
    | {
        [itemId: ItemId]: InventoryItem;
      }
    | undefined;
};

export type OrderedInventoryIndex = {
  [positionId: PositionId]: InventoryItem;
};

export type RemoveItemOperationResult = {
  success: boolean;
  removedAll: boolean;
  remainingQuantity: number;
};

export type InternalClientEvents = {
  "brz-inventory:itemReceived": [ItemId, Quantity];
  "brz-inventory:setState": [OrderedInventoryIndex];
};
