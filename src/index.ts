import { Timestamp } from "firebase/firestore";
import _ from "lodash";
import scraper from "../services/scraper.js";

export interface Update {
  title: string;
  date: string;
  url: string;
}

export interface UpdateDoc {
  created_at: Timestamp;
  data: Update;
}

export async function checkUpdate(lastUpdate: Update) {
  let latestUpdate = await scraper.getLatestUpdate();

  const updates: Update[] = [];

  while (!_.isEqual(lastUpdate, latestUpdate.data)) {
    updates.unshift(latestUpdate.data);
    latestUpdate = latestUpdate.next();
  }
  return updates;
}
