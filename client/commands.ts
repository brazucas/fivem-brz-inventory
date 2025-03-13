import { getItemInfo } from "@common/helpers";
import { getState } from "./inventory-state";

export const printInventoryCommand = async (source: number) => {
  const inventoryState = getState();

  const formattedMessage = Object.entries(inventoryState)
    .map(([_, { quantity, itemId }]) => {
      const itemInfo = getItemInfo(itemId);
      return `Item ${itemInfo?.name || itemId}: ${quantity}x`;
    })
    .join("\n");

  console.log("formattedMessage", formattedMessage);

  emit("chat:addMessage", {
    color: [255, 255, 255],
    multiline: true,
    args: ["Inventory", formattedMessage],
  });
};

RegisterCommand("printInventory", printInventoryCommand, false);
