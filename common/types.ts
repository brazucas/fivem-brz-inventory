declare const ITEM_DEFAULTS: Partial<Item> | undefined;

export type Inventory = {
  id: string;
  maxWeight: number;
  maxItems: number;
  items: InventoryItems;
  type: keyof typeof InventoryType;
  metadata: Record<string, any>;
};

export type QSInventoryItem = {
  name: string;
  label: string;
  weight: number;
  type: string;
  image: string;
  unique: boolean;
  useable: boolean;
  shouldClose: boolean;
  description: string;
};

export type ThirdPartyInventory = "qs-inventory";

export type Settings = {
  loadThirdPartyInventory: ThirdPartyInventory | undefined;
};

export const PlayerSlots: Slot[] = [
  {
    category: "apparel",
    position: 0,
    supportedItemConditions: [
      {
        type: "category",
        value: "headwear",
      },
    ],
    placeholderImage: "placeholder_headwear",
  },
  {
    category: "apparel",
    position: 0,
    supportedItemConditions: [
      {
        type: "category",
        value: "chestwear",
      },
    ],
    placeholderImage: "placeholder_chestwear",
  },
  {
    category: "apparel",
    position: 0,
    supportedItemConditions: [
      {
        type: "category",
        value: "handwear",
      },
    ],
    placeholderImage: "placeholder_handwear",
  },
  {
    category: "apparel",
    position: 0,
    supportedItemConditions: [
      {
        type: "category",
        value: "pants",
      },
    ],
    placeholderImage: "placeholder_pants",
  },
  {
    category: "apparel",
    position: 0,
    supportedItemConditions: [
      {
        type: "category",
        value: "footwear",
      },
    ],
    placeholderImage: "placeholder_footwear",
  },
];

export type Slot = {
  category: keyof typeof SlotCategory;
  position: number;
  defaultHotKey?: string;
  supportedItemConditions: ItemCondition[];
  placeholderImage: string;
};

export type ItemCondition = {
  type: "item" | "category";
  value: ItemId | string;
};

export const SlotCategory = {
  apparel: "apparel",
  weapon: "weapon",
  ammo: "ammo",
  tool: "tool",
  consumable: "consumable",
  buffs: "buffs",
} as const;

export const InventoryType = {
  player: "player",
  object: "object",
  vehicle: "vehicle",
  worldPosition: "worldPosition",
} as const;

export type NewItem = {
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

export type Item = NewItem & {
  id: ItemId;
};

export type NewInventoryItem = {
  itemId: ItemId;
  quantity: number;
  durability: number;
};

export type InventoryItem = NewInventoryItem & {
  id: InventoryItemId;
};

export const ItemType = {
  weapon: "weapon",
  food: "food",
  tool: "tool",
  apparel: "apparel",
  misc: "misc",
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
  ...(ITEM_DEFAULTS || {}),
};

export type ItemId = string & { __opaque__: "ItemId" };

export type InventoryId = string & { __opaque__: "InventoryId" };

export type InventoryItemId = string & { __opaque__: "InventoryItemId" };

export type PlayerId = number & { __opaque__: "PlayerId" };

export type Quantity = number & { __opaque__: "Quantity" };

export type PositionId = number & { __opaque__: "PositionId" };

export type InventoryItems = {
  [itemId: ItemId]: InventoryItem;
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
