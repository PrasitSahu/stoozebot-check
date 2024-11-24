import axios from "axios";
import { LatestUpdate } from "../src/getUpdate";
import { Update } from "../src/index";
import * as cheerio from "cheerio";

class Scraper {
  private static url = new URL("https://www.soa.ac.in/iter");

  contructor() {}

  async getLatestUpdate() {
    const res = await axios.get(Scraper.url.href);
    const $ = cheerio.load(res.data);
    const targetElSelector = ".summary-item-list .summary-item";

    function returnData(child: number): Update {
      return {
        title: $(
          `${targetElSelector}:nth-child(${child}) .summary-content .summary-title a`
        ).prop("innerText") as string,

        url: `${Scraper.url.origin}${$(
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
}

export default new Scraper();