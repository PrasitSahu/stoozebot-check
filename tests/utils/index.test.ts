import { generateUID, withTimeStamp } from "../../utils";
import { Update, UpdateDoc } from "../../src";

describe("utils", () => {
  it("returns an object with a created_on time stamp and a data field containing the update object", () => {
    const update: Update = {
      title: "test title",
      date: "3 Mar 1999",
      url: "https://example.com",
    };

    const doc: UpdateDoc = withTimeStamp(update);

    expect(doc).toEqual({
      created_at: doc.created_at,
      data: update,
    });
  });

  it("generates an unique id", () => {
    const uids = [0, 0, 0].map((id) => generateUID());
    expect.assertions(uids.length + 1);

    for (let i = 1; i < uids.length; i++) {
      for (let j = 0; j < uids.length; j++)
        if (j !== i) expect(uids[i]).not.toBe(uids[j]);
    }
  });
});
