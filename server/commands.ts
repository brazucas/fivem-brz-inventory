import {
  InternalClientEvents,
  InventoryId,
  ItemId,
  Quantity,
} from "@common/types";
import { createInventoryItem, getItem } from "./inventory-server.service";
import { emitNetTyped } from "@core/helpers/cfx";
import { notify } from "@core/notification";
import { randomUUID } from "crypto";

export const givePlayerItemCommand = async (source: number, args: string[]) => {
  if (args.length < 3) {
    notify(
      source,
      `Invalid number of arguments, expected: 3, received: ${args.length}`,
      "error"
    );
    return;
  }

  const playerId = parseInt(args[0]);
  const itemId = String(args[1]) as ItemId;
  const quantity = parseInt(args[2]) as Quantity;

  if (!playerId || !itemId || !quantity) {
    emitNet("chat:addMessage", source, {
      args: ["Invalid arguments"],
    });
    return;
  }

  const inventoryItem = getItem(itemId);

  if (!inventoryItem) {
    notify(source, `The item ${itemId} doesn't exists`, "error");
    return;
  }

  await createInventoryItem({
    id: randomUUID(),
    durability: 100,
    inventoryId: "player_steam-id" as InventoryId,
    itemId,
    quantity,
  });

  notify(
    source,
    `Item ${itemId} (${quantity}x) given to player ${playerId}`,
    "success"
  );

  emitNetTyped<InternalClientEvents, "brz-inventory:itemReceived">(
    "brz-inventory:itemReceived",
    playerId,
    itemId,
    quantity
  );
};

RegisterCommand("givePlayerItem", givePlayerItemCommand, false);
