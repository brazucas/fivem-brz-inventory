import {
  InternalClientEvents,
  InventoryItemId,
  ItemId,
  Quantity,
} from "@common/types";
import {
  emitNetTyped,
  isPlayerConnected,
} from "@brz-fivem-sdk/server/helpers/cfx";
import { notify } from "@brz-fivem-sdk/server/notification";
import { randomUUID } from "crypto";
import {
  upsertInventoryItem,
  getItem,
  getPlayerInventoryId,
  removeInventoryItem,
  listItems,
} from "./inventory.service";

export const givePlayerItemCommand = async (source: number, args: string[]) => {
  const attributes = validateInventoryItemCommand(source, args);

  if (!attributes) {
    return;
  }

  const { playerId, itemId, quantity, playerName } = attributes;

  try {
    await upsertInventoryItem(getPlayerInventoryId(playerId), {
      id: randomUUID() as InventoryItemId,
      durability: 100,
      itemId,
      quantity,
    });

    notify(
      source,
      `Item ${itemId} (${quantity}x) given to player ${playerName}`,
      "success"
    );

    emitNetTyped<InternalClientEvents, "brz-inventory:itemReceived">(
      "brz-inventory:itemReceived",
      Number(playerId),
      itemId,
      quantity
    );
  } catch (err) {
    console.error(err);
    notify(
      source,
      `An error occurred while giving item ${itemId} over to player ${playerName}`,
      "error"
    );
  }
};

export const removePlayerItemCommand = async (
  source: number,
  args: string[]
) => {
  const attributes = validateInventoryItemCommand(source, args);

  if (!attributes) {
    return;
  }

  const { itemId, quantity, playerName } = attributes;

  try {
    await removeInventoryItem(
      getPlayerInventoryId(attributes.playerId),
      itemId,
      quantity
    );

    notify(
      source,
      `Removed item ${itemId} (${quantity}x) from ${playerName}`,
      "success"
    );
  } catch (err) {
    console.error(err);
    notify(
      source,
      `An error occurred while removing item ${itemId} from ${playerName}`,
      "error"
    );
  }
};

const validateInventoryItemCommand = (source: number, args: string[]) => {
  if (args.length < 3) {
    notify(
      source,
      `Invalid number of arguments, expected: 3, received: ${args.length}`,
      "error"
    );
    return;
  }

  const playerId = String(args[0]);
  const itemId = String(args[1]) as ItemId;
  const quantity = parseInt(args[2]) as Quantity;

  if (!isPlayerConnected(playerId)) {
    notify(source, `Player id ${playerId} is not connected`, "error");
    return;
  }

  const playerName = GetPlayerName(playerId);
  const inventoryItem = getItem(itemId);

  if (!inventoryItem) {
    notify(source, `The item ${itemId} doesn't exists`, "error");
    return;
  }

  return { playerId, itemId, quantity, playerName };
};

const listConsoleAllItems = async (source: number) => {
  if (source !== 0) {
    notify(source, "This command is not available", "error");
    return;
  }

  const items = await listItems();
  const itemIds = items.map((item) => item.id).join(", ");

  notify(source, `Items: ${itemIds}`, "success");
};

RegisterCommand("givePlayerItem", givePlayerItemCommand, false);
RegisterCommand("removePlayerItem", removePlayerItemCommand, false);
RegisterCommand("listConsoleAllItems", listConsoleAllItems, false);
