import { Timestamp } from "firebase/firestore";
import { Update, UpdateDoc } from "../src";

export function withTimeStamp(update: Update): UpdateDoc {
  return {
    created_at: Timestamp.now(),
    data: update,
  };
}

export function generateUID(rand: number = Math.floor(Math.random() * 10)) {
  const randAlphs = () =>
    [0, 0, 0, 0].map((alph) => Math.floor(Math.random() * (122 - 97 + 1)) + 97);

  return `${randAlphs()
    .map((alph) => String.fromCharCode(alph))
    .join("")}${Math.floor(Math.random() * 1000)}${Math.floor(
    Math.random() * 1000
  )}-${Date.now()}r${rand}-${Math.random().toString(36).substr(2, 9)}`;
}
