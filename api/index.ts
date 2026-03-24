import { createApp } from "../server/app";
import type { Express } from "express";

let app: Express | null = null;
let initPromise: Promise<Express> | null = null;

function getApp(): Promise<Express> {
  if (app) return Promise.resolve(app);
  if (!initPromise) {
    initPromise = createApp().then((a) => {
      app = a;
      return a;
    });
  }
  return initPromise;
}

export default async function handler(req: any, res: any) {
  const expressApp = await getApp();
  return expressApp(req, res);
}
