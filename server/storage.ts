import { 
  type HistoryEntry, 
  type InsertHistoryEntry,
  type SavedPhrase,
  type InsertSavedPhrase,
  type GameProgress,
  type InsertGameProgress,
  type Settings,
  type InsertSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // History
  getHistory(): Promise<HistoryEntry[]>;
  addHistoryEntry(entry: InsertHistoryEntry): Promise<HistoryEntry>;
  updateHistoryEntry(id: string, updates: Partial<HistoryEntry>): Promise<HistoryEntry | undefined>;
  deleteHistoryEntry(id: string): Promise<boolean>;
  
  // Saved Phrases
  getSavedPhrases(): Promise<SavedPhrase[]>;
  addSavedPhrase(phrase: InsertSavedPhrase): Promise<SavedPhrase>;
  deleteSavedPhrase(id: string): Promise<boolean>;
  
  // Game Progress
  getGameProgress(): Promise<GameProgress>;
  updateGameProgress(updates: Partial<GameProgress>): Promise<GameProgress>;
  
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<Settings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private history: Map<string, HistoryEntry>;
  private savedPhrases: Map<string, SavedPhrase>;
  private gameProgress: GameProgress;
  private settings: Settings;

  constructor() {
    this.history = new Map();
    this.savedPhrases = new Map();
    this.gameProgress = {
      id: "default",
      unlockedTiers: [1],
      flashcardStats: {
        tier1Score: 0,
        tier2Score: 0,
        tier3Score: 0,
      }
    };
    this.settings = {
      id: "default",
      theme: "Rebel",
      fontSize: 20,
    };
  }

  async getHistory(): Promise<HistoryEntry[]> {
    return Array.from(this.history.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async addHistoryEntry(entry: InsertHistoryEntry): Promise<HistoryEntry> {
    const id = randomUUID();
    const fullEntry: HistoryEntry = { ...entry, id };
    this.history.set(id, fullEntry);
    return fullEntry;
  }

  async updateHistoryEntry(id: string, updates: Partial<HistoryEntry>): Promise<HistoryEntry | undefined> {
    const existing = this.history.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.history.set(id, updated);
    return updated;
  }

  async deleteHistoryEntry(id: string): Promise<boolean> {
    return this.history.delete(id);
  }

  async getSavedPhrases(): Promise<SavedPhrase[]> {
    return Array.from(this.savedPhrases.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async addSavedPhrase(phrase: InsertSavedPhrase): Promise<SavedPhrase> {
    const id = randomUUID();
    const fullPhrase: SavedPhrase = { ...phrase, id };
    this.savedPhrases.set(id, fullPhrase);
    return fullPhrase;
  }

  async deleteSavedPhrase(id: string): Promise<boolean> {
    return this.savedPhrases.delete(id);
  }

  async getGameProgress(): Promise<GameProgress> {
    return this.gameProgress;
  }

  async updateGameProgress(updates: Partial<GameProgress>): Promise<GameProgress> {
    this.gameProgress = { ...this.gameProgress, ...updates };
    return this.gameProgress;
  }

  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(updates: Partial<Settings>): Promise<Settings> {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }
}

export const storage = new MemStorage();
