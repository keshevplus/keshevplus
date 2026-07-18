import { images } from "./shared/schema";
import { db } from "./server/db";

async function test1() {
  const filename: string | null = "x";
  await db.insert(images).values({ slot: "a", mimeType: "b", data: "c", filename });
}

async function test2() {
  const filename: string | undefined = "x";
  await db.insert(images).values({ slot: "a", mimeType: "b", data: "c", filename });
}

async function test3() {
  await db.insert(images).values({ slot: "a", mimeType: "b", data: "c", filename: null });
}
