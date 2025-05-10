import {
  InventoryId,
  InventoryItemId,
  InventoryType,
  ItemId,
  ItemRarity,
  ItemTier,
  ItemType,
} from "@common/types";

export type StoredInventory = {
  id: InventoryId;
  maxWeight: number;
  maxItems: number;
  type: keyof typeof InventoryType;
};

export type StoredInventoryItem = {
  id: InventoryItemId;
  inventoryId: InventoryId;
  itemId: ItemId;
  quantity: number;
  durability: number;
};

export type StoredItem = {
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
