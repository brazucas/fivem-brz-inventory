import { OrderedInventoryIndex } from "@common/types";
import { setState } from "./inventory-state";

onNet("brz-inventory:setState", (inventory: OrderedInventoryIndex) =>
  setState(inventory)
);
