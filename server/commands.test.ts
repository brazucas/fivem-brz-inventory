global.RegisterCommand = jest.fn();
global.GetPlayerName = jest.fn().mockReturnValue("player-name");

import { isPlayerConnected } from "@core/helpers/cfx";
import { notify } from "@core/notification";
import { givePlayerItemCommand } from "./commands";
import { createInventoryItem, getItem } from "./inventory-server.service";

jest.mock("./inventory-server.service", () => ({
  createInventoryItem: jest.fn(),
  getItem: jest.fn(),
}));

jest.mock("@core/helpers/cfx", () => ({
  emitNetTyped: jest.fn(),
  isPlayerConnected: jest.fn().mockReturnValue(true),
}));

jest.mock("@core/notification", () => ({
  notify: jest.fn(),
}));

describe("commands", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("/giveplayeritem", () => {
    it("should validate if player exists and give them an item", async () => {
      (getItem as jest.Mock).mockReturnValueOnce({});

      await givePlayerItemCommand(1, ["10", "item-id", "1"]);

      expect(createInventoryItem).toHaveBeenCalledWith({
        id: expect.any(String),
        inventoryId: "player_steam-id",
        itemId: "item-id",
        quantity: 1,
        durability: 100,
      });

      expect(notify).toHaveBeenCalledWith(
        1,
        "Item item-id (1x) given to player player-name",
        "success"
      );
    });

    it("should not send same item id on subsequent invokations", async () => {
      (getItem as jest.Mock).mockReturnValueOnce({});
      (getItem as jest.Mock).mockReturnValueOnce({});

      await givePlayerItemCommand(1, ["10", "item-id", "1"]);
      const generatedItemId = (createInventoryItem as jest.Mock).mock
        .calls[0][0].id;

      await givePlayerItemCommand(1, ["11", "item-id", "1"]);
      expect(createInventoryItem).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          id: generatedItemId,
        })
      );

      expect(createInventoryItem).not.toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          id: generatedItemId,
        })
      );

      expect(createInventoryItem).toHaveBeenCalledTimes(2);
    });

    it("should notify when target player is not connected", async () => {
      (isPlayerConnected as jest.Mock).mockReturnValueOnce(false);

      await givePlayerItemCommand(1, ["10", "item-id", "1"]);

      expect(notify).toHaveBeenCalledWith(
        1,
        "Player id 10 is not connected",
        "error"
      );
    });

    it("should notify when an error occurs while giving item", async () => {
      (getItem as jest.Mock).mockReturnValueOnce({});
      (createInventoryItem as jest.Mock).mockRejectedValueOnce(
        new Error("An error occurred")
      );

      await givePlayerItemCommand(1, ["10", "item-id", "1"]);

      expect(notify).toHaveBeenCalledWith(
        1,
        "An error occurred while giving item item-id over to player player-name",
        "error"
      );
    });

    describe("error scenarios", () => {
      afterEach(() => {
        expect(createInventoryItem).not.toHaveBeenCalled();
      });

      it("should notify an error when item doesn't exist", async () => {
        (getItem as jest.Mock).mockReturnValueOnce(null);

        await givePlayerItemCommand(1, ["10", "item-id", "1"]);

        expect(notify as jest.Mock).toHaveBeenCalledWith(
          1,
          "The item item-id doesn't exists",
          "error"
        );
      });

      describe("should notify an error when there's less than 3 arguments", () => {
        test.each([
          {
            params: ["10", "item-id"],
          },
          {
            params: ["10"],
          },
          {
            params: [],
          },
        ])("when sending $params", async ({ params }) => {
          (getItem as jest.Mock).mockReturnValueOnce(null);

          await givePlayerItemCommand(1, params);

          expect(notify as jest.Mock).toHaveBeenCalledWith(
            1,
            `Invalid number of arguments, expected: 3, received: ${params.length}`,
            "error"
          );
        });
      });
    });
  });
});
