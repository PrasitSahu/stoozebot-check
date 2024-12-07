import { Timestamp } from "firebase/firestore";
import _ from "lodash";

export interface Update {
  title: string;
  date: string;
  url: string;
}

export interface UpdateDoc {
  created_at: Timestamp;
  data: Update;
}

export async function checkUpdate(lastUpdate: Update, latestUpdate: any) {
  let lUpdate = latestUpdate;
  const updates: Update[] = [];

  while (!_.isEqual(lastUpdate, lUpdate.data)) {
    updates.unshift(lUpdate.data);
    lUpdate = lUpdate.next();
  }
  return updates;
}

export async function genUpdateDoc(updates: Update[]) {
  const updateDocs: UpdateDoc[] = [];
  for (let update of updates) {
    const doc: UpdateDoc = {
      created_at: Timestamp.now(),
      data: update,
    };

    updateDocs.push(doc);
    await new Promise((res) => setTimeout(res, 3));
  }

  return updateDocs;
}
