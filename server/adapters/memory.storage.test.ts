import { Item, ItemId } from "@common/types";
import { registerItem, getItem } from "./memory.storage";

describe("MemoryStorage", () => {
  const props = {
    id: "test" as ItemId,
    name: "Test Item",
    type: "weapon",
    description: "A test item",
    tier: 1,
    rarity: "common",
    weight: 1,
    stackable: true,
    decayable: false,
    droppable: true,
    groundObject: "hei_prop_hei_paper_bag",
    usable: false,
    initialDurability: 100,
    tradable: false,
  };

  it("should store a new item", async () => {
    const item = await registerItem(props as Item);
    expect(item).toEqual(props);
  });

  it("should retriave a stored item", async () => {
    const item = await registerItem(props as Item);
    expect(getItem("test")).toEqual(props);
  });
});
