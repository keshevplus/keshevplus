import type { Express, Request, Response } from "express";
import { pool } from "./db";
import { storage } from "./storage";
import { hasPrivilegedAdminRole, isSuperadminEmail } from "@shared/adminAccess";

// One-off admin tool for populating the dev database with synthetic leads
// and activity history, so the admin dashboard's list views, search, and
// pagination can be exercised at scale. Every row is tagged
// source = "seed_loadtest" so it can be found and removed independently of
// real data (and independently of any other isTest-flagged records).
const SEED_SOURCE = "seed_loadtest";
const ACTIVITY_TYPES = ["call", "email", "note", "meeting"] as const;
const TEST_STATUS_VALUES = ["lead", "client"] as const;
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 180;
const MAX_COUNT_PER_CALL = 5000;

const FIRST_NAMES = [
  "Noa", "Itai", "Maya", "Omer", "Shira", "Yonatan", "Tamar", "Daniel",
  "Michal", "Roi", "Adi", "Guy", "Liat", "Nadav", "Yael", "Tom",
  "Avigail", "Eitan", "Gal", "Hila",
];
const LAST_NAMES = [
  "Cohen", "Levi", "Mizrahi", "Peretz", "Biton", "Dahan", "Azoulay", "Katz",
  "Friedman", "Avraham", "Malka", "Shapira", "Amar", "Ben-David", "Sasson",
];

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function activityDescription(type: string): string {
  switch (type) {
    case "call":
      return "Simulated call activity (load test data)";
    case "email":
      return "Simulated email activity (load test data)";
    case "meeting":
      return "Simulated meeting activity (load test data)";
    default:
      return "Simulated note activity (load test data)";
  }
}

async function hasAdminAccess(req: Request): Promise<boolean> {
  const userId = (req.session as any)?.userId;
  if (!userId) return false;
  const user = await storage.getUser(userId);
  if (!user) return false;
  return hasPrivilegedAdminRole(user.role) || user.email === "admin@keshevplus.co.il" || isSuperadminEmail(user.email);
}

async function seedBatch(count: number) {
  const { rows: maxRows } = await pool.query(
    `SELECT COALESCE(MAX(lead_number), 0) AS max FROM clients`
  );
  let nextLeadNumber = Number(maxRows[0].max) + 1;
  const now = Date.now();

  const clientValues: string[] = [];
  const clientParams: any[] = [];
  let p = 1;
  const plannedCreatedAt: Date[] = [];

  for (let i = 0; i < count; i++) {
    const leadNumber = nextLeadNumber++;
    const createdAt = new Date(now - Math.random() * SIX_MONTHS_MS);
    plannedCreatedAt.push(createdAt);
    clientValues.push(
      `($${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++})`
    );
    clientParams.push(
      leadNumber,
      `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
      `loadtest.lead.${leadNumber}@example.test`,
      `05${Math.floor(10000000 + Math.random() * 89999999)}`,
      randomFrom(TEST_STATUS_VALUES),
      SEED_SOURCE,
      true,
      createdAt,
    );
  }

  const { rows: insertedClients } = await pool.query(
    `INSERT INTO clients (lead_number, name, email, phone, status, source, is_test, created_at)
     VALUES ${clientValues.join(",")}
     RETURNING id, created_at`,
    clientParams
  );

  const activityValues: string[] = [];
  const activityParams: any[] = [];
  let ap = 1;
  let activitiesPlanned = 0;

  for (const row of insertedClients) {
    const activityCount = 2 + Math.floor(Math.random() * 3);
    let cursor = new Date(row.created_at).getTime();
    for (let i = 0; i < activityCount; i++) {
      const type = ACTIVITY_TYPES[i % ACTIVITY_TYPES.length];
      cursor += Math.random() * (SIX_MONTHS_MS / (activityCount + 1));
      const activityAt = new Date(Math.min(cursor, now));
      activityValues.push(`($${ap++}, $${ap++}, $${ap++}, $${ap++})`);
      activityParams.push(row.id, type, activityDescription(type), activityAt);
      activitiesPlanned++;
    }
  }

  if (activityValues.length) {
    await pool.query(
      `INSERT INTO client_activities (client_id, type, description, created_at)
       VALUES ${activityValues.join(",")}`,
      activityParams
    );
  }

  return { clientsInserted: insertedClients.length, activitiesInserted: activitiesPlanned };
}

export function registerLoadTestSeedRoutes(app: Express): void {
  app.post("/api/admin/seed-load-test-leads", async (req: Request, res: Response) => {
    if (!(await hasAdminAccess(req))) {
      return res.status(403).json({ error: "Admin access required" });
    }
    const count = Number(req.body?.count);
    if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT_PER_CALL) {
      return res.status(400).json({ error: `count must be an integer between 1 and ${MAX_COUNT_PER_CALL}` });
    }
    try {
      const result = await seedBatch(count);
      const { rows } = await pool.query(loadTestCountSql, [SEED_SOURCE]);
      return res.json({ ...result, ...rows[0] });
    } catch (error) {
      console.error("Error seeding load test leads:", error);
      return res.status(500).json({ error: "Failed to seed load test leads" });
    }
  });

  app.get("/api/admin/seed-load-test-leads/count", async (req: Request, res: Response) => {
    if (!(await hasAdminAccess(req))) {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { rows } = await pool.query(loadTestCountSql, [SEED_SOURCE]);
    return res.json(rows[0]);
  });

  app.get("/api/admin/seed-load-test-leads/sample", async (req: Request, res: Response) => {
    if (!(await hasAdminAccess(req))) {
      return res.status(403).json({ error: "Admin access required" });
    }
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const { rows } = await pool.query(
      `SELECT id, lead_number AS "leadNumber", client_number AS "clientNumber", name, email, phone, status, created_at AS "createdAt"
       FROM clients
       WHERE source = $1 AND is_test = true
       ORDER BY created_at DESC
       LIMIT $2`,
      [SEED_SOURCE, limit]
    );
    return res.json(rows);
  });

  app.delete("/api/admin/seed-load-test-leads", async (req: Request, res: Response) => {
    if (!(await hasAdminAccess(req))) {
      return res.status(403).json({ error: "Admin access required" });
    }
    try {
      await pool.query(
        `DELETE FROM client_activities WHERE client_id IN (SELECT id FROM clients WHERE source = $1 AND is_test = true)`,
        [SEED_SOURCE]
      );
      const { rowCount } = await pool.query(`DELETE FROM clients WHERE source = $1 AND is_test = true`, [SEED_SOURCE]);
      return res.json({ deleted: rowCount });
    } catch (error) {
      console.error("Error deleting load test leads:", error);
      return res.status(500).json({ error: "Failed to delete load test leads" });
    }
  });
}

const loadTestCountSql = `
  SELECT
    COUNT(*)::int AS "totalSeeded",
    COUNT(*) FILTER (WHERE status = 'lead')::int AS "leadCount",
    COUNT(*) FILTER (WHERE status = 'client')::int AS "clientCount",
    MIN(created_at) AS "oldestCreatedAt",
    MAX(created_at) AS "newestCreatedAt"
  FROM clients
  WHERE source = $1 AND is_test = true
`;
