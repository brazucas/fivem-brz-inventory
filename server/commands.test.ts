global.RegisterCommand = jest.fn();
global.GetPlayerName = jest.fn().mockReturnValue("player-name");

import { isPlayerConnected } from "@core/helpers/cfx";
import { notify } from "@core/notification";
import { givePlayerItemCommand, removePlayerItemCommand } from "./commands";
import {
  upsertInventoryItem,
  getItem,
  removeInventoryItem,
} from "./inventory.service";

jest.mock("./inventory-server.service", () => ({
  upsertInventoryItem: jest.fn(),
  getItem: jest.fn(),
  removeInventoryItem: jest.fn(),
  getPlayerInventoryId: jest.fn().mockReturnValue("player_player-name"),
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

      expect(upsertInventoryItem).toHaveBeenCalledWith({
        id: expect.any(String),
        inventoryId: "player_player-name",
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
      const generatedItemId = (upsertInventoryItem as jest.Mock).mock
        .calls[0][0].id;

      await givePlayerItemCommand(1, ["11", "item-id", "1"]);
      expect(upsertInventoryItem).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          id: generatedItemId,
        })
      );

      expect(upsertInventoryItem).not.toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          id: generatedItemId,
        })
      );

      expect(upsertInventoryItem).toHaveBeenCalledTimes(2);
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
      (upsertInventoryItem as jest.Mock).mockRejectedValueOnce(
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
        expect(upsertInventoryItem).not.toHaveBeenCalled();
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

  describe("/removeplayeritem", () => {
    it("should remove item from player inventory", async () => {
      (getItem as jest.Mock).mockReturnValueOnce({});
      (removeInventoryItem as jest.Mock).mockResolvedValueOnce(true);
      await removePlayerItemCommand(1, ["10", "item-id", "1"]);

      expect(notify).toHaveBeenCalledWith(
        1,
        "Removed item item-id (1x) from player-name",
        "success"
      );
    });

    it("should notify when target player is not connected", async () => {
      (isPlayerConnected as jest.Mock).mockReturnValueOnce(false);

      await removePlayerItemCommand(1, ["10", "item-id", "1"]);

      expect(notify).toHaveBeenCalledWith(
        1,
        "Player id 10 is not connected",
        "error"
      );
    });

    it("should notify when an error occurs while removing item", async () => {
      (getItem as jest.Mock).mockReturnValueOnce({});
      (removeInventoryItem as jest.Mock).mockRejectedValueOnce(
        new Error("An error occurred")
      );

      await removePlayerItemCommand(1, ["10", "item-id", "1"]);

      expect(notify).toHaveBeenCalledWith(
        1,
        "An error occurred while removing item item-id from player-name",
        "error"
      );
    });

    describe("error scenarios", () => {
      afterEach(() => {
        expect(removeInventoryItem).not.toHaveBeenCalled();
      });

      it("should notify an error when item doesn't exist", async () => {
        (getItem as jest.Mock).mockReturnValueOnce(null);

        await removePlayerItemCommand(1, ["10", "item-id", "1"]);

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

          await removePlayerItemCommand(1, params);

          expect(notify as jest.Mock).toHaveBeenCalledWith(
            1,
            `Invalid number of arguments, expected: 3, received: ${params.length}`,
            "error"
          );
        });
      });
    });
  });

  describe("register commands", () => {
    beforeAll(() => {
      jest.resetModules();
    });

    it("should register /giveplayeritem and /removeplayeritem commands", () => {
      require("./commands");

      expect(RegisterCommand).toHaveBeenCalledWith(
        "givePlayerItem",
        expect.any(Function),
        false
      );

      expect(RegisterCommand).toHaveBeenCalledWith(
        "removePlayerItem",
        expect.any(Function),
        false
      );
    });
  });
});
