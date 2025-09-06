import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHistoryEntrySchema, 
  insertSavedPhraseSchema,
  insertGameProgressSchema,
  insertSettingsSchema,
  ocrRequestSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { analyzeAurebeshImage } from "./lib/openai-vision";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  
  // History routes
  app.get("/api/history", async (req, res) => {
    try {
      const history = await storage.getHistory();
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/history", async (req, res) => {
    try {
      const entry = insertHistoryEntrySchema.parse(req.body);
      const newEntry = await storage.addHistoryEntry(entry);
      res.json(newEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid history entry", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add history entry" });
      }
    }
  });

  app.patch("/api/history/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedEntry = await storage.updateHistoryEntry(id, updates);
      if (!updatedEntry) {
        res.status(404).json({ error: "History entry not found" });
      } else {
        res.json(updatedEntry);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update history entry" });
    }
  });

  app.delete("/api/history/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteHistoryEntry(id);
      if (!deleted) {
        res.status(404).json({ error: "History entry not found" });
      } else {
        res.json({ success: true });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete history entry" });
    }
  });

  // Saved phrases routes
  app.get("/api/saved-phrases", async (req, res) => {
    try {
      const phrases = await storage.getSavedPhrases();
      res.json(phrases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch saved phrases" });
    }
  });

  app.post("/api/saved-phrases", async (req, res) => {
    try {
      const phrase = insertSavedPhraseSchema.parse(req.body);
      const newPhrase = await storage.addSavedPhrase(phrase);
      res.json(newPhrase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid saved phrase", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add saved phrase" });
      }
    }
  });

  app.delete("/api/saved-phrases/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSavedPhrase(id);
      if (!deleted) {
        res.status(404).json({ error: "Saved phrase not found" });
      } else {
        res.json({ success: true });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete saved phrase" });
    }
  });

  // Game progress routes
  app.get("/api/game-progress", async (req, res) => {
    try {
      const progress = await storage.getGameProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch game progress" });
    }
  });

  app.patch("/api/game-progress", async (req, res) => {
    try {
      const updates = req.body;
      const updatedProgress = await storage.updateGameProgress(updates);
      res.json(updatedProgress);
    } catch (error) {
      res.status(500).json({ error: "Failed to update game progress" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const updates = req.body;
      const updatedSettings = await storage.updateSettings(updates);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // OCR route for image translation using OpenAI Vision
  app.post("/api/ocr", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Convert buffer to base64 for processing
      const base64Image = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      
      // Use OpenAI Vision to analyze Aurebesh text
      const result = await analyzeAurebeshImage(base64Image, mimeType);
      
      res.json(result);
    } catch (error) {
      console.error('OCR processing error:', error);
      res.status(500).json({ error: "OCR processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
