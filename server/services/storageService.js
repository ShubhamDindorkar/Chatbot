import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import winston from 'winston';

// Storage service for sessions and leads
class StorageService {
  constructor(logger) {
    this.logger = logger;
    this.SESSIONS_FILE = new URL('../sessions.json', import.meta.url);
    this.LEADS_FILE = new URL('../leads.json', import.meta.url);
    this.userSessions = new Map();
    this.leadsStore = [];
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    // Load sessions from file on startup
    try {
      const data = await fs.readFile(this.SESSIONS_FILE, 'utf8');
      const sessionsData = JSON.parse(data);
      this.userSessions = new Map(Object.entries(sessionsData));
    } catch (error) {
      // File doesn't exist yet, start with empty map
      this.userSessions = new Map();
    }

    // Load leads from file on startup
    try {
      const data = await fs.readFile(this.LEADS_FILE, 'utf8');
      this.leadsStore = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start with empty array
      this.leadsStore = [];
    }

    this.initialized = true;
  }

  async saveSessionsToFile() {
    try {
      const sessionsObj = Object.fromEntries(this.userSessions);
      await fs.writeFile(this.SESSIONS_FILE, JSON.stringify(sessionsObj, null, 2));
    } catch (error) {
      this.logger.error('Failed to save sessions to file', { error: error.message });
    }
  }

  async saveLeadsToFile() {
    try {
      await fs.writeFile(this.LEADS_FILE, JSON.stringify(this.leadsStore, null, 2));
    } catch (error) {
      this.logger.error('Failed to save leads to file', { error: error.message });
    }
  }

  getSession(sessionId) {
    return this.userSessions.get(sessionId);
  }

  setSession(sessionId, data) {
    this.userSessions.set(sessionId, data);
    return this.saveSessionsToFile();
  }

  addLead(leadData) {
    const leadId = `lead_${randomUUID()}`;
    const lead = {
      id: leadId,
      ...leadData,
      created_at: new Date().toISOString(),
    };
    this.leadsStore.push(lead);
    this.saveLeadsToFile();
    return leadId;
  }

  getLeads() {
    return this.leadsStore;
  }
}

export default StorageService;
