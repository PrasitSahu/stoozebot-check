import "../../env.config.js";
// 👆 stays there

import { app, InvocationContext, Timer } from "@azure/functions";
import {
  addDoc,
  collection,
  CollectionReference,
  Timestamp,
} from "firebase/firestore";
import { firestoreDB } from "../../firebase.config.js";
import { getLastUpdate } from "../../services/firebase/firestore.js";
import partialUpdateQService from "../../services/serviceBus/partialUpdateQService.js";
import { checkUpdate, Update, UpdateDoc } from "../index.js";

let cachedLastUpdate: Promise<UpdateDoc> = getLastUpdate(firestoreDB);

async function schedule(timer: Timer, ctx: InvocationContext) {
  try {
    const lastUpdate = (await cachedLastUpdate).data;
    const updates: Update[] = await checkUpdate(lastUpdate);

    if (updates.length) {
      console.log("update(s) available!");

      const docs: UpdateDoc[] = updates.map((update) => ({
        created_at: Timestamp.now(),
        data: update,
      }));

      for (let doc of docs) {
        await addDoc(
          collection(firestoreDB, "updates") as CollectionReference<UpdateDoc>,
          doc
        );
      }

      await partialUpdateQService.sendMessages(updates);

      cachedLastUpdate = Promise.resolve(docs[docs.length - 1]);
    } else {
      console.log("No update available.");
    }
  } catch (error) {
    ctx.error(error);
  }
}

app.timer("schedule", {
  handler: schedule,
  schedule: "*/5 * * * *",
});
