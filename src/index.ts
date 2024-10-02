import { addDoc, collection, Timestamp } from "firebase/firestore";
import _ from "lodash";
import { firestoreDB as db } from "../firebase.config.js";
import { withTimeStamp } from "../utils/index.js";
import { getLastUpdate, getLatestUpdate, LatestUpdate } from "./getUpdate.js";
import sendMessages from "./serviceBus/sendMessages.js";

export interface Update {
  title: string;
  date: string;
  url: string;
}

export interface UpdateDoc {
  created_at: Timestamp;
  data: Update;
}

export default async function checkUpdate() {
  let latestUpdate: LatestUpdate | null = null;

  try {
    latestUpdate = await getLatestUpdate();
    const lastUpdate = await getLastUpdate();

    const updates: Update[] = [];

    while (!_.isEqual(latestUpdate.data, lastUpdate.data)) {
      updates.unshift(latestUpdate.data);
      latestUpdate = latestUpdate.next();
    }

    if (updates.length) {
      console.log("Update(s) available!");

      // enqueue updates to message queue
      await sendMessages(updates);

      // insert updates to database
      for (let update of updates) {
        await addDoc(collection(db, "updates"), withTimeStamp(update));
      }
    } else console.log("no updates yet!");
  } catch (error: any) {
    if (error.code === "EMTCOL") {
      latestUpdate &&
        (await addDoc(
          collection(db, "updates"),
          withTimeStamp(latestUpdate.data)
        ));
    } else {
      throw error;
    }
  } finally {
    process.exit();
  }
}
