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
import QueueService from "../../services/serviceBus/index.js";
import partialUpdateQService from "../../services/serviceBus/partialUpdateQService.js";
import { checkUpdate, Update, UpdateDoc } from "../index.js";

let cachedLastUpdate: Promise<UpdateDoc> = getLastUpdate(firestoreDB);

async function schedule(timer: Timer, ctx: InvocationContext) {
  try {
    const lastUpdate = (await cachedLastUpdate).data;
    const updates: Update[] = await checkUpdate(lastUpdate);

    if (updates.length) {
      console.log("update(s) available!");

      for (let update of updates) {
        const doc: UpdateDoc = {
          created_at: Timestamp.now(),
          data: update,
        };

        await addDoc(
          collection(firestoreDB, "updates") as CollectionReference<UpdateDoc>,
          doc
        );

        cachedLastUpdate = Promise.resolve(doc);
        await new Promise((res) => setTimeout(res, 1));
      }

      await partialUpdateQService.sendMessages(updates);
    } else {
      console.log("No update available.");
    }
  } catch (error) {
    ctx.error(error);
  } finally {
    await QueueService.closeAllClients();
  }
}

app.timer("schedule", {
  handler: schedule,
  schedule: "*/5 * * * *",
});
