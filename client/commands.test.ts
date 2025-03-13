global.RegisterCommand = jest.fn();
global.emit = jest.fn();
(global as any).ITEMS = [
  {
    id: "crowbar",
    name: "Crowbar",
    type: "weapon",
    description:
      "A trusty tool for prying things open, or for when you just need to make a point.",
    tier: 1,
    rarity: "common",
    weight: 2000,
    stackable: false,
    decayable: false,
    droppable: true,
    usable: true,
    onUseHandler: "useCrowbar",
    tradable: true,
  },
  {
    id: "hat",
    name: "Hat",
    type: "weapon",
    description: "Description 2",
    tier: 1,
    rarity: "common",
    weight: 2000,
    stackable: false,
    decayable: false,
    droppable: true,
    usable: true,
    onUseHandler: "useItem2",
    tradable: true,
  },
];

import { printInventoryCommand } from "./commands";
import { getState } from "./inventory-state";

jest.mock("./inventory-state", () => ({
  getState: jest.fn(),
}));

describe("commands", () => {
  describe("printInventoryCommand", () => {
    it("should print the inventory", async () => {
      const consoleLogSpy = jest.spyOn(console, "log");

      (getState as jest.Mock).mockReturnValue({
        "1": { id: "1", quantity: 1, itemId: "crowbar" },
        "2": { id: "2", quantity: 2, itemId: "hat" },
      });

      await printInventoryCommand(1);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "formattedMessage",
        "Item Crowbar: 1x\nItem Hat: 2x"
      );
    });
  });
});
