import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { OpenAI } from 'openai';
import fs from 'node:fs/promises';
import winston from 'winston';

// Import services
import PersonaService from './services/personaService.js';
import IntentService from './services/intentService.js';
import PromptService from './services/promptService.js';
import StorageService from './services/storageService.js';

// Import middleware
import authenticateApiKey from './middleware/auth.js';
import { validateChatRequest, validateLeadRequest } from './middleware/validation.js';

// Import routes
import { createChatRoutes } from './routes/chat.js';
import { createLeadRoutes } from './routes/leads.js';

// Configure structured logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Load configuration
const knowledgeBase = JSON.parse(
  await fs.readFile(new URL('../src/data/knowledge-base.json', import.meta.url), 'utf8'),
);

const promptsConfig = JSON.parse(
  await fs.readFile(new URL('./prompts.json', import.meta.url), 'utf8'),
);

// Initialize services
const storageService = new StorageService(logger);
await storageService.initialize();

const personaService = new PersonaService();
const intentService = new IntentService(knowledgeBase);
const promptService = new PromptService(promptsConfig);

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ 
  apiKey: openaiApiKey,
  timeout: 30000,
}) : null;

const services = {
  storageService,
  personaService,
  intentService,
  promptService,
  logger,
  openai,
};

// Setup Express app
const app = express();
const port = process.env.PORT || 4000;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.body.sessionId || req.ip,
  message: 'Too many requests, please try again later.',
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) || [],
    credentials: true,
  }),
);
app.use(express.json());

// Apply authentication and rate limiting to API routes
app.use('/api/chat', authenticateApiKey, limiter, validateChatRequest);
app.use('/api/leads', authenticateApiKey, limiter, validateLeadRequest);

// Setup routes
createChatRoutes(app, services);
createLeadRoutes(app, services);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Start server
app.listen(port, () => {
  logger.info(`Kaal Chatbot API listening on port ${port}`);
});
