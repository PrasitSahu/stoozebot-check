import _ from "lodash";
import { Update } from "../../src";
import { testLastUpdate, testLatestUpdate } from "./getUpdate.test";

// mocks
jest.mock("../../src/getUpdate", () => ({
  getLatestUpdate: async () => testLatestUpdate,
  getLastUpdate: async () => testLastUpdate,
}));

jest.mock("../../src/serviceBus/sendMessages", () => ({
  sendMessages: async (updates: Update[]) =>
    await new Promise((res, rej) => {
      setTimeout(() => {
        res("");
      }, 500);
    }),
}));

const checkUpdate = jest.fn(async () => {
  const modules = await import("../../src/getUpdate");
  let latestUpdate = await modules.getLatestUpdate();
  const lastUpdate = await modules.getLastUpdate();

  const updates: Update[] = [];
  while (!_.isEqual(latestUpdate.data, lastUpdate.data)) {
    updates.unshift(latestUpdate.data);
    latestUpdate = latestUpdate.next();
  }

  return updates;
});

describe("check update", () => {
  it("checks for any real update(s) and adds them to the queue and the database", () => {
    expect(checkUpdate()).resolves.toEqual([testLatestUpdate.data]);
  });
});
