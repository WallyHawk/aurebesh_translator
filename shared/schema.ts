import { z } from "zod";

// Translation History Entry
export const historyEntrySchema = z.object({
  id: z.string(),
  english: z.string(),
  aurebesh: z.string(),
  favorite: z.boolean().default(false),
  timestamp: z.string(), // ISO date string
});

export const insertHistoryEntrySchema = historyEntrySchema.omit({ id: true });

export type HistoryEntry = z.infer<typeof historyEntrySchema>;
export type InsertHistoryEntry = z.infer<typeof insertHistoryEntrySchema>;

// Saved Phrases
export const savedPhraseSchema = z.object({
  id: z.string(),
  phrase: z.string(),
  timestamp: z.string(),
});

export const insertSavedPhraseSchema = savedPhraseSchema.omit({ id: true });

export type SavedPhrase = z.infer<typeof savedPhraseSchema>;
export type InsertSavedPhrase = z.infer<typeof insertSavedPhraseSchema>;

// Game Progress
export const gameProgressSchema = z.object({
  id: z.string(),
  unlockedTiers: z.array(z.number()).default([1]),
  flashcardStats: z.object({
    tier1Score: z.number().default(0),
    tier2Score: z.number().default(0),
    tier3Score: z.number().default(0),
  }).default({}),
});

export const insertGameProgressSchema = gameProgressSchema.omit({ id: true });

export type GameProgress = z.infer<typeof gameProgressSchema>;
export type InsertGameProgress = z.infer<typeof insertGameProgressSchema>;

// Settings
export const settingsSchema = z.object({
  id: z.string(),
  theme: z.enum(["Rebel", "Imperial", "Light Side", "Dark Side", "Bounty Hunter"]).default("Rebel"),
  fontSize: z.number().min(16).max(32).default(20),
});

export const insertSettingsSchema = settingsSchema.omit({ id: true });

export type Settings = z.infer<typeof settingsSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// OCR Request
export const ocrRequestSchema = z.object({
  imageData: z.string(), // base64 encoded image
});

export type OCRRequest = z.infer<typeof ocrRequestSchema>;
