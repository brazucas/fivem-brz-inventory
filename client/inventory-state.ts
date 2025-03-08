import { OrderedInventoryIndex } from "@common/types";

const state: OrderedInventoryIndex = {};

export const setState = (newState: OrderedInventoryIndex) =>
  Object.assign(state, newState);

export const getState = (): OrderedInventoryIndex => state;
