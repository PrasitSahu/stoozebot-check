import * as cheerio from "cheerio";
import axios from "axios";

export interface Update {
  title: string;
  date: string;
  url: string;
}

(async function () {
  const url = new URL("https://www.soa.ac.in/iter");

  const res = await axios.get(url.href);

  const $ = cheerio.load(res.data);
  const targetElSelctor = ".summary-item-list .summary-item";
  // const updateEl = $(targetElSelctor);

  const latestUpdate: Update = {
    title: $(`${targetElSelctor} .summary-content .summary-title a`).prop(
      "innerText"
    ) as string,

    url: `${url.origin}${$(
      `${targetElSelctor} .summary-content .summary-title a`
    ).prop("href")}`,

    date: new Date(
      $(
        `${targetElSelctor} .summary-content .summary-metadata-container .summary-metadata time`
      ).prop("datetime")
    ).toLocaleDateString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
  console.log(latestUpdate);
})();
