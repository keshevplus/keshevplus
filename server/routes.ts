import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, languageSettingsSchema } from "@shared/schema";
import { z } from "zod";

const DEFAULT_LANGUAGE_SETTINGS = {
  enabled: false,
  mode: "bilingual" as const,
  defaultLanguage: "he",
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/contact", async (req, res) => {
    try {
      const result = insertContactSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error.message });
      }
      await storage.createContact(result.data);
      return res.json({ success: true, message: "Form submitted successfully" });
    } catch (error) {
      console.error("Contact form error:", error);
      return res.status(500).json({ success: false, message: "Failed to submit form" });
    }
  });

  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      return res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.patch("/api/contacts/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.markContactRead(id);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }
      return res.json(contact);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update contact" });
    }
  });

  app.get("/api/settings/language", async (_req, res) => {
    try {
      const setting = await storage.getSetting("language");
      if (setting) {
        return res.json(setting.value);
      }
      return res.json(DEFAULT_LANGUAGE_SETTINGS);
    } catch (error) {
      console.error("Error fetching language settings:", error);
      return res.json(DEFAULT_LANGUAGE_SETTINGS);
    }
  });

  app.put("/api/settings/language", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.email !== "admin@keshevplus.co.il")) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const result = languageSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.message });
      }

      const setting = await storage.upsertSetting("language", result.data);
      return res.json(setting.value);
    } catch (error) {
      console.error("Error saving language settings:", error);
      return res.status(500).json({ error: "Failed to save settings" });
    }
  });

  app.post("/api/firecrawl-scrape", async (req, res) => {
    try {
      const { url, options } = req.body;

      if (!url) {
        return res.status(400).json({ success: false, error: "URL is required" });
      }

      const apiKey = process.env.FIRECRAWL_API_KEY;
      if (!apiKey) {
        console.error("FIRECRAWL_API_KEY not configured");
        return res.status(500).json({ success: false, error: "Firecrawl connector not configured" });
      }

      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
        formattedUrl = `https://${formattedUrl}`;
      }

      console.log("Scraping URL:", formattedUrl);

      const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formattedUrl,
          formats: options?.formats || ["markdown", "html", "screenshot", "links"],
          onlyMainContent: options?.onlyMainContent ?? false,
          waitFor: options?.waitFor || 2000,
          location: options?.location,
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        console.error("Firecrawl API error:", data);
        return res.status(response.status).json({
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
        });
      }

      console.log("Scrape successful");
      return res.json(data);
    } catch (error) {
      console.error("Error scraping:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to scrape";
      return res.status(500).json({ success: false, error: errorMessage });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const bcrypt = await import("bcryptjs");
      const compare = bcrypt.default?.compare || bcrypt.compare;
      const valid = await compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      (req.session as any).userId = user.id;
      return res.json({ id: user.id, email: user.email, role: user.role });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    return res.json({ id: user.id, email: user.email, role: user.role });
  });

  const httpServer = createServer(app);
  return httpServer;
}
