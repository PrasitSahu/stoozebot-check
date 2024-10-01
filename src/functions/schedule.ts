import { app, InvocationContext, Timer } from "@azure/functions";
import checkUpdate from "../index.js";

async function schedule(timer: Timer, ctx: InvocationContext) {
  await checkUpdate();
}

app.timer("schedule", {
  handler: schedule,
  schedule: "*/5 * * * *",
});
