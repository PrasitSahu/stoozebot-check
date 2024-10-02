import { Timestamp } from "firebase/firestore";
import { getLastUpdate, getLatestUpdate } from "../../src/getUpdate";
import { UpdateDoc } from "../../src/index";

export const testLatestUpdate = {
  data: {
    title: "test title",
    date: "29 Mar 1999",
    url: "https://example.com",
  },
  next() {
    return {
      data: {
        title: "old",
        date: "old",
        url: "https://example.com",
      },
      next: {},
      child: 2,
    };
  },
  child: 1,
};

export const testLastUpdate: UpdateDoc = {
  created_at: Timestamp.now(),
  data: {
    title: "old",
    date: "old",
    url: "https://example.com",
  },
};

// mocks
jest.mock("../../src/getUpdate", () => ({
  getLatestUpdate: async () => testLatestUpdate,
  getLastUpdate: async () => testLastUpdate,
}));

describe("get updates", () => {
  it("gets latest update", () => {
    expect(getLatestUpdate()).resolves.toEqual(testLatestUpdate);
  });

  it("gets last saved update", () => {
    expect(getLastUpdate()).resolves.toEqual(testLastUpdate);
  });
});
