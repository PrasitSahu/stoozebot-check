import axios from "axios";
import { Update } from "../src/index";
import * as cheerio from "cheerio";
import _ from "lodash";

export interface LatestUpdate {
  el: cheerio.Cheerio<any>;
  data: () => Update;
  isNext: () => boolean;
  next: () => LatestUpdate | null;
}
class Scraper {
  private static readonly url = new URL("https://www.soa.ac.in/iter");

  contructor() {}

  async loadPage() {
    try {
      const res = await axios.get(Scraper.url.href);
      return cheerio.load(res.data);
    } catch (error) {
      throw error;
    }
  }

  async getLatestUpdate(): Promise<LatestUpdate> {
    const $ = await this.loadPage();

    const targetSelector =
      "div.summary-block-wrapper div.summary-item-list-container div.summary-item-list > div:first";
    let el = cheerio.load(
      $("h2:contains('Notice Board')")
        .closest("div.col.sqs-col-12.span-12")
        .toString()
    )(targetSelector);

    return {
      el,
      data() {
        return Scraper.genNotice(this.el);
      },
      isNext() {
        return this.el.next().toString() !== "";
      },
      next() {
        if (!this.isNext()) return null;
        return { ...this, el: this.el.next() };
      },
    } as LatestUpdate;
  }

  public static genNotice(el: cheerio.Cheerio<any>): Update {
    return {
      date: new Date(
        el
          .children("div.summary-content")
          .children("div.summary-metadata-container")
          .children("div.summary-metadata")
          .children("time")
          .prop("datetime")
      ).toLocaleDateString("default", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      title: _.join(
        _.filter(
          _.split(
            _.trim(
              el
                .children("div.summary-content")
                .children("div.summary-title")
                .children("a")
                .prop("innerText") as string
            ),
            /\s+/
          )
        ),
        " "
      ),
      url: (Scraper.url.origin +
        el
          .children("div.summary-content")
          .children("div.summary-title")
          .children("a")
          .prop("href")) as string,
    };
  }
}

export default new Scraper();
