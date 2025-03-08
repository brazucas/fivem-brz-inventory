import {
  InternalClientEvents,
  InventoryId,
  ItemId,
  Quantity,
} from "@common/types";
import { createInventoryItem, getItem } from "./inventory-server.service";
import { emitNetTyped, isPlayerConnected } from "@core/helpers/cfx";
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

  const playerId = String(args[0]);
  const itemId = String(args[1]) as ItemId;
  const quantity = parseInt(args[2]) as Quantity;

  if (!playerId || !itemId || !quantity) {
    emitNet("chat:addMessage", source, {
      args: ["Invalid arguments"],
    });
    return;
  }

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

  try {
    await createInventoryItem({
      id: randomUUID(),
      durability: 100,
      inventoryId: "player_steam-id" as InventoryId,
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

RegisterCommand("givePlayerItem", givePlayerItemCommand, false);
