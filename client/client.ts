import { OrderedInventoryIndex } from "@common/types";
import { setState } from "./inventory-state";
import "./commands";

onNet("brz-inventory:setState", (inventory: OrderedInventoryIndex) =>
  setState(inventory)
);
