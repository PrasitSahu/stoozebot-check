import { Timestamp } from "firebase/firestore";
import { Update, UpdateDoc } from "../src";

export function withTimeStamp(update: Update): UpdateDoc {
  return {
    created_at: Timestamp.now(),
    data: update,
  };
}
