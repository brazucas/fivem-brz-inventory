global.RegisterCommand = jest.fn();
global.emit = jest.fn();

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
        "1": { id: "1", quantity: 1 },
        "2": { id: "2", quantity: 2 },
      });

      await printInventoryCommand(1);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "formattedMessage",
        "Item 1: 1x\nItem 2: 2x"
      );
    });
  });
});
