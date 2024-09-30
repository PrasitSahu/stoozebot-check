import axios from "axios";
import * as cheerio from "cheerio";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { firestoreDB as db } from "../firebase.config.js";
import { Update, UpdateDoc } from "./index.js";

export interface LatestUpdate {
  readonly data: Update;
  next(): {
    child: number;
    data: Update;
    next: () => LatestUpdate;
  };
  child: number;
}

export async function getLastUpdate() {
  const updatesRef = collection(db, "updates");
  const q = query(updatesRef, orderBy("created_at", "desc"), limit(1));

  const docs = (await getDocs(q)).docs;

  if (!docs.length) {
    const err = new Error() as any;
    err.code = "EMTCOL";
    err.message = "Empty collection";

    throw err;
  }

  return docs[0].data() as UpdateDoc;
}

export async function getLatestUpdate() {
  const url = new URL("https://www.soa.ac.in/iter");

  const res = await axios.get(url.href);

  const $ = cheerio.load(res.data);
  const targetElSelector = ".summary-item-list .summary-item";

  function returnData(child: number): Update {
    return {
      title: $(
        `${targetElSelector}:nth-child(${child}) .summary-content .summary-title a`
      ).prop("innerText") as string,

      url: `${url.origin}${$(
        `${targetElSelector}:nth-child(${child}) .summary-content .summary-title a`
      ).prop("href")}`,

      date: new Date(
        $(
          `${targetElSelector}:nth-child(${child}) .summary-content .summary-metadata-container .summary-metadata time`
        ).prop("datetime")
      ).toLocaleDateString("default", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    } satisfies Update;
  }

  return {
    get data() {
      return returnData(this.child);
    },
    next() {
      return {
        ...this,
        child: this.child + 1,
        get data(): Update {
          return returnData(this.child);
        },
      };
    },
    child: 1,
  };
}
