import { getState } from "./inventory-state";

export const printInventoryCommand = async (source: number) => {
  const inventoryState = getState();

  const formattedMessage = Object.entries(inventoryState)
    .map(([itemId, { quantity }]) => `Item ${itemId}: ${quantity}x`)
    .join("\n");

  console.log("formattedMessage", formattedMessage);

  emit("chat:addMessage", {
    color: [255, 255, 255],
    multiline: true,
    args: ["Inventory", formattedMessage],
  });
};

RegisterCommand("printInventory", printInventoryCommand, false);
