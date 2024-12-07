import "../../env.config.js";
// 👆 stays there

import { app, InvocationContext, Timer } from "@azure/functions";
import { addDoc, collection, CollectionReference } from "firebase/firestore";
import { firestoreDB } from "../../firebase.config.js";
import { getLastUpdate } from "../../services/firebase/firestore.js";
import scraper from "../../services/scraper.js";
import QueueService from "../../services/serviceBus/index.js";
import partialUpdateQService from "../../services/serviceBus/partialUpdateQService.js";
import { checkUpdate, genUpdateDoc, Update, UpdateDoc } from "../index.js";

let cachedLastUpdate: Promise<UpdateDoc | null> = getLastUpdate(firestoreDB);

async function scheduleCheck(timer: Timer, ctx: InvocationContext) {
  try {
    const lastUpdate = (await cachedLastUpdate)?.data;

    if (!lastUpdate) return ctx.log("No last Updates saved!");
    let latestUpdate = await scraper.getLatestUpdate();

    const updates: Update[] = await checkUpdate(lastUpdate, latestUpdate);

    if (updates.length) {
      ctx.log("update(s) available!");

      const updateDocs = await genUpdateDoc(updates);

      for (const doc of updateDocs) {
        await addDoc(
          collection(firestoreDB, "updates") as CollectionReference<UpdateDoc>,
          doc
        );
        cachedLastUpdate = Promise.resolve(doc);

        // TODO: Add failure checking of message queue
        await partialUpdateQService.sendMessages(updates);
      }
    } else {
      ctx.log("No update available.");
    }
  } catch (error) {
    ctx.error(error);
  } finally {
    await QueueService.closeAllClients();
  }
}

app.timer("check", {
  handler: scheduleCheck,
  schedule: "*/5 * * * *",
});
