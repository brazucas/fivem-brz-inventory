import { getState, setState } from "./inventory-state";

describe("inventory state", () => {
  describe("setState", () => {
    it("should set the current state", () => {
      const state = { "1": { id: "1", quantity: 1 } };
      setState(state);

      expect(getState()).toEqual(state);
    });
  });

  describe("getState", () => {
    it("should return the current state", () => {
      const state = { "1": { id: "1", quantity: 1 } };
      setState(state);

      expect(getState()).toEqual(state);
    });
  });
});
